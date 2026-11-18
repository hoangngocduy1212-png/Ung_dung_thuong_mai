import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sellerService } from '../../services/sellerService';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import type { Product } from '../../types/catalog';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Layers,
  ArrowRight,
  Package,
} from 'lucide-react';

export const SellerProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await sellerService.getProducts({ limit: 50 });
      setProducts(res.items || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleVisibility = async (productId: string) => {
    const target = products.find((p) => p._id === productId);
    if (!target) return;
    try {
      const updated = await sellerService.toggleVisibility(productId, !target.hidden);
      setProducts(products.map((p) => (p._id === productId ? { ...p, hidden: updated.hidden } : p)));
    } catch (err: any) {
      alert(err?.message || 'Không thể đổi trạng thái ẩn/hiện sản phẩm.');
    }
  };

  const handleDelete = async (productId: string) => {
    const ok = window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?');
    if (!ok) return;
    try {
      await sellerService.deleteProduct(productId);
      setProducts(products.filter((p) => p._id !== productId));
    } catch (err: any) {
      alert(err?.message || 'Không thể xóa sản phẩm.');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (val?: number) => {
    if (typeof val !== 'number') return '0 ₫';
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Quản lý sản phẩm ({products.length})
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Kiểm soát danh mục sản phẩm, cấu hình biến thể kho và giá bán trên sàn
          </p>
        </div>

        <Link
          to="/seller/products/new"
          className="px-4 py-2.5 bg-[#FF5C00] hover:bg-[#E55200] text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm sản phẩm mới</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-neutral-200">
        <Search className="w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm sản phẩm theo tên..."
          className="flex-1 text-xs outline-none bg-transparent"
        />
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="py-16">
          <Loading message="Đang tải danh sách sản phẩm..." />
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="Chưa có sản phẩm nào"
          description="Bắt đầu đăng tải thiết bị công nghệ đầu tiên lên gian hàng của bạn."
          actionText="Đăng sản phẩm mới"
          onAction={() => navigate('/seller/products/new')}
        />
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 font-mono">
                  <th className="py-3 px-6">Sản phẩm</th>
                  <th className="py-3 px-4">Danh mục</th>
                  <th className="py-3 px-4">Giá sàn</th>
                  <th className="py-3 px-4 text-center">Tồn kho</th>
                  <th className="py-3 px-4 text-center">Đã bán</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-neutral-50/50 transition">
                    <td className="py-4 px-6 max-w-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded border border-neutral-200 bg-neutral-50 p-1 flex-shrink-0 flex items-center justify-center">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80'}
                            alt={p.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="truncate">
                          <h4 className="font-bold text-neutral-900 truncate leading-snug">{p.name}</h4>
                          <span className="text-[10px] text-neutral-400 font-mono">ID: {p._id.slice(-6)}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-neutral-600">
                      {p.category?.name || 'Mặc định'}
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-[#FF5C00]">
                      {formatPrice(p.minPrice)}
                    </td>

                    <td className="py-4 px-4 text-center font-mono font-semibold text-neutral-800">
                      {p.totalStock ?? '-'}
                    </td>

                    <td className="py-4 px-4 text-center font-mono text-neutral-600">
                      {p.soldCount || 0}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleVisibility(p._id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold transition cursor-pointer ${
                          p.hidden
                            ? 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                        title="Nhấn để đổi trạng thái ẩn/hiện trên Storefront"
                      >
                        {p.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{p.hidden ? 'Đang ẩn' : 'Hiển thị'}</span>
                      </button>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(p)}
                          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-700 hover:text-[#FF5C00] hover:border-orange-200 transition cursor-pointer"
                          title="Xem nhanh chi tiết biến thể và tồn kho"
                        >
                          <Layers className="w-3.5 h-3.5" />
                        </button>

                        <Link
                          to={`/seller/products/${p._id}/edit`}
                          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-700 hover:text-[#FF5C00] hover:border-orange-200 transition"
                          title="Chỉnh sửa sản phẩm"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-200 transition cursor-pointer"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Variant Details Modal (Stitch Spec: seller_studio_chi_ti_t_s_n_ph_m) */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#FF5C00]" />
            <span>Chi tiết biến thể &amp; Tồn kho</span>
          </div>
        }
        description={
          selectedProduct ? (
            <span className="font-mono text-xs">
              Sản phẩm: <strong className="text-neutral-900">{selectedProduct.name}</strong> (Mã: {selectedProduct._id})
            </span>
          ) : undefined
        }
        showFooter={false}
        maxWidth="lg"
      >
        {selectedProduct && (
          <div className="space-y-5 pt-1">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="block text-[11px] text-neutral-500 font-mono">TỔNG BIẾN THỂ</span>
                <span className="text-lg font-bold font-mono text-neutral-900">
                  {selectedProduct.variants?.length || 1}
                </span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="block text-[11px] text-neutral-500 font-mono">TỔNG TỒN KHO</span>
                <span className="text-lg font-bold font-mono text-neutral-900">
                  {selectedProduct.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ?? selectedProduct.totalStock ?? 0}
                </span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="block text-[11px] text-neutral-500 font-mono">GIÁ THẤP NHẤT</span>
                <span className="text-lg font-bold font-mono text-[#FF5C00]">
                  {formatPrice(selectedProduct.minPrice)}
                </span>
              </div>
            </div>

            {/* Variants Table */}
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 font-mono">
                    <th className="py-2.5 px-4">Tên biến thể</th>
                    <th className="py-2.5 px-3 font-mono">Mã SKU</th>
                    <th className="py-2.5 px-3 font-mono">Giá bán</th>
                    <th className="py-2.5 px-3 text-center font-mono">Tồn kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                    selectedProduct.variants.map((v) => (
                      <tr key={v._id || v.name} className="hover:bg-neutral-50/50">
                        <td className="py-3 px-4 font-medium text-neutral-900 flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{v.name}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-500">{v.sku || 'N/A'}</td>
                        <td className="py-3 px-3 font-mono font-bold text-[#FF5C00]">
                          {formatPrice(v.price)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-neutral-800">
                          {v.stock}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-neutral-400 text-xs">
                        Sản phẩm này có 1 biến thể mặc định với giá {formatPrice(selectedProduct.minPrice)}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
              <Link
                to={`/seller/products/${selectedProduct._id}/edit`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF5C00] hover:bg-[#E55200] text-white text-xs font-bold rounded-lg transition"
              >
                <span>Chỉnh sửa cấu hình biến thể</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
