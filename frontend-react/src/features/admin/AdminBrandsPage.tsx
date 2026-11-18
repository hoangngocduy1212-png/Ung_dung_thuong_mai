import React, { useEffect, useState } from 'react';
import { catalogService } from '../../services/catalogService';
import { adminService } from '../../services/adminService';
import type { Brand } from '../../types/catalog';

export const AdminBrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await catalogService.getBrands();
      setBrands(res || []);
    } catch (err: any) {
      console.error('Fetch brands error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setName('');
    setLogo('');
    setShowModal(true);
  };

  const handleOpenEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setName(brand.name);
    setLogo(brand.logo || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên thương hiệu.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingBrand) {
        await adminService.updateBrand(editingBrand._id, {
          name: name.trim(),
          logo: logo.trim() || undefined,
        });
      } else {
        await adminService.createBrand({
          name: name.trim(),
          logo: logo.trim() || undefined,
        });
      }
      setShowModal(false);
      fetchBrands();
    } catch (err: any) {
      alert(err?.message || 'Không thể lưu thương hiệu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, brandName: string) => {
    const ok = window.confirm(`Bạn có chắc muốn xóa thương hiệu "${brandName}" không?`);
    if (!ok) return;

    try {
      await adminService.deleteBrand(id);
      fetchBrands();
    } catch (err: any) {
      alert(err?.message || 'Không thể xóa thương hiệu (kiểm tra còn sản phẩm liên quan hay không).');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Thương hiệu Đối tác</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Quản lý các thương hiệu công nghệ chính hãng trên toàn bộ hệ sinh thái TECHSTORE ({brands.length} thương hiệu).
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#171717] text-white text-xs font-semibold rounded hover:bg-neutral-800 transition-colors shadow-2xs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Thêm thương hiệu mới
        </button>
      </div>

      {/* Grid of Brands */}
      {loading ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center text-xs text-neutral-400 font-mono">
          Đang tải danh sách thương hiệu...
        </div>
      ) : brands.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center text-xs text-neutral-400">
          Chưa có thương hiệu nào. Hãy tạo thương hiệu đầu tiên.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.map((brand) => (
            <div
              key={brand._id}
              className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-col items-center justify-between text-center hover:border-neutral-400 transition-all shadow-2xs group"
            >
              <div className="w-16 h-16 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center p-2 mb-3 overflow-hidden">
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="font-mono font-bold text-neutral-400 text-sm">
                    {brand.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="w-full">
                <h3 className="font-bold text-xs text-neutral-900 truncate">{brand.name}</h3>
                <span className="text-[10px] font-mono text-neutral-400 block mt-0.5 truncate">{brand._id}</span>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-neutral-100 w-full justify-center">
                <button
                  onClick={() => handleOpenEdit(brand)}
                  className="text-[11px] text-neutral-600 hover:text-neutral-900 font-medium"
                >
                  Sửa
                </button>
                <span className="text-neutral-200">•</span>
                <button
                  onClick={() => handleDelete(brand._id, brand.name)}
                  className="text-[11px] text-red-600 hover:text-red-700 font-medium"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900 mb-1">
              {editingBrand ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Nhập tên thương hiệu và liên kết hình ảnh logo đại diện.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Tên thương hiệu*</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Apple, ASUS, Dell, Sony..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">URL Logo (Tùy chọn)</label>
                <input
                  type="url"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-[#171717] text-white font-semibold rounded hover:bg-neutral-800 disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu thương hiệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
