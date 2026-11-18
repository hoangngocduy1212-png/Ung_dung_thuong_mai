import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sellerService } from '../../services/sellerService';
import { catalogService } from '../../services/catalogService';
import type { Category, Brand } from '../../types/catalog';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  AlertCircle,
} from 'lucide-react';

interface VariantRow {
  name: string;
  sku: string;
  price: number;
  stock: number;
}

export const SellerProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([
    { name: 'Mặc định', sku: 'SKU-01', price: 1000000, stock: 10 },
  ]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.allSettled([catalogService.getCategories(), catalogService.getBrands()]).then(
      ([catRes, brandRes]) => {
        if (catRes.status === 'fulfilled') setCategories(catRes.value || []);
        if (brandRes.status === 'fulfilled') setBrands(brandRes.value || []);
      }
    );

    if (isEdit && id) {
      setLoading(true);
      sellerService
        .getProductById(id)
        .then((prod) => {
          setName(prod.name);
          setCategoryId(typeof prod.category === 'object' ? prod.category._id : prod.category || '');
          setBrandId(typeof prod.brand === 'object' ? prod.brand._id : prod.brand || '');
          setDescription(prod.description || '');
          setImages(prod.images || []);
          if (prod.variants && prod.variants.length > 0) {
            setVariants(
              prod.variants.map((v) => ({
                name: v.name,
                sku: v.sku || '',
                price: v.price,
                stock: v.stock,
              }))
            );
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { name: `Biến thể ${variants.length + 1}`, sku: `SKU-0${variants.length + 1}`, price: 1000000, stock: 10 },
    ]);
  };

  const handleRemoveVariant = (idx: number) => {
    if (variants.length <= 1) {
      alert('Sản phẩm phải có ít nhất 1 biến thể (SKU).');
      return;
    }
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const handleVariantChange = (idx: number, field: keyof VariantRow, value: any) => {
    const next = [...variants];
    next[idx] = { ...next[idx], [field]: value };
    setVariants(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên sản phẩm.');
      return;
    }
    if (!categoryId) {
      setError('Vui lòng chọn danh mục sản phẩm.');
      return;
    }
    if (variants.length === 0) {
      setError('Sản phẩm cần có ít nhất 1 biến thể.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        name,
        category: categoryId,
        brand: brandId || undefined,
        description,
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80'],
        variants: variants.map((v) => ({
          name: v.name,
          sku: v.sku,
          price: Number(v.price),
          stock: Number(v.stock),
        })),
      };

      if (isEdit && id) {
        await sellerService.updateProduct(id, payload);
      } else {
        await sellerService.createProduct(payload);
      }

      navigate('/seller/products');
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi lưu sản phẩm.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-neutral-400">
        Đang tải thông tin sản phẩm...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <Link
            to="/seller/products"
            className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              {isEdit ? 'Chỉnh sửa sản phẩm' : 'Đăng tải sản phẩm mới'}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Nhập thông số kỹ thuật, tải hình ảnh và tạo danh sách biến thể SKU
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 bg-[#FF5C00] hover:bg-[#E55200] disabled:bg-neutral-300 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Đang lưu...' : 'Lưu sản phẩm'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Basic Info */}
        <section className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 pb-2 border-b border-neutral-100">
            1. Thông tin chung
          </h2>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Laptop Dell Inspiron 15 3530 i5 8GB 512GB"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#FF5C00]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#FF5C00] bg-white"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Thương hiệu (Hãng)
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#FF5C00] bg-white"
              >
                <option value="">-- Không có / Khác --</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Mô tả chi tiết sản phẩm
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả thông số kỹ thuật, linh kiện, chính sách bảo hành..."
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#FF5C00] resize-none"
            />
          </div>
        </section>

        {/* Card 2: Images */}
        <section className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 pb-2 border-b border-neutral-100">
            2. Hình ảnh sản phẩm
          </h2>

          <div className="flex gap-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Dán link ảnh (https://...)"
              className="flex-1 px-3.5 py-2 border border-neutral-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#FF5C00]"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Thêm ảnh
            </button>
          </div>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 rounded-lg border border-neutral-200 overflow-hidden group bg-neutral-50 p-1 flex items-center justify-center"
                >
                  <img src={img} alt={`Preview ${idx}`} className="max-h-full max-w-full object-contain" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Card 3: Variants & Stock (Ma trận biến thể) */}
        <section className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-900">
              3. Biến thể (SKU) & Tồn kho
            </h2>
            <button
              type="button"
              onClick={handleAddVariant}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF5C00] hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm biến thể</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 font-mono">
                  <th className="py-2.5 px-3">Tên biến thể</th>
                  <th className="py-2.5 px-3">Mã SKU</th>
                  <th className="py-2.5 px-3">Giá bán (VND)</th>
                  <th className="py-2.5 px-3">Tồn kho</th>
                  <th className="py-2.5 px-3 text-right">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {variants.map((v, i) => (
                  <tr key={i}>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        required
                        value={v.name}
                        onChange={(e) => handleVariantChange(i, 'name', e.target.value)}
                        placeholder="VD: 8GB / 256GB"
                        className="w-full px-2.5 py-1.5 border border-neutral-300 rounded text-xs outline-none focus:ring-1 focus:ring-[#FF5C00]"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => handleVariantChange(i, 'sku', e.target.value)}
                        placeholder="SKU-..."
                        className="w-full px-2.5 py-1.5 border border-neutral-300 rounded text-xs outline-none focus:ring-1 focus:ring-[#FF5C00] font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="1000"
                        required
                        value={v.price}
                        onChange={(e) => handleVariantChange(i, 'price', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-neutral-300 rounded text-xs outline-none focus:ring-1 focus:ring-[#FF5C00] font-mono font-bold text-[#FF5C00]"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="0"
                        required
                        value={v.stock}
                        onChange={(e) => handleVariantChange(i, 'stock', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-neutral-300 rounded text-xs outline-none focus:ring-1 focus:ring-[#FF5C00] font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(i)}
                        className="p-1 text-neutral-400 hover:text-red-500 transition cursor-pointer"
                        title="Xóa biến thể"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </form>
    </div>
  );
};
