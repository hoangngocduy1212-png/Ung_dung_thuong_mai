import React, { useEffect, useState } from 'react';
import { catalogService } from '../../services/catalogService';
import { adminService } from '../../services/adminService';
import type { Category } from '../../types/catalog';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await catalogService.getCategories();
      setCategories(res || []);
    } catch (err: any) {
      console.error('Fetch categories error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setParentId('');
    setShowModal(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setParentId(cat.parent ? (typeof cat.parent === 'object' ? (cat.parent as any)._id : cat.parent) : '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên danh mục.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        await adminService.updateCategory(editingCategory._id, {
          name: name.trim(),
          parent: parentId ? parentId : null,
        });
      } else {
        await adminService.createCategory({
          name: name.trim(),
          parent: parentId ? parentId : null,
        });
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      alert(err?.message || 'Không thể lưu danh mục.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    const ok = window.confirm(`Bạn có chắc muốn xóa danh mục "${catName}" không?`);
    if (!ok) return;

    try {
      await adminService.deleteCategory(id);
      fetchCategories();
    } catch (err: any) {
      alert(err?.message || 'Không thể xóa danh mục (kiểm tra danh mục con hoặc sản phẩm liên quan).');
    }
  };

  // Top-level categories (no parent)
  const rootCategories = categories.filter((c) => !c.parent);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Cây Danh mục Sản phẩm</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Quản trị cấu trúc danh mục ngành hàng đa cấp phục vụ phân loại và điều hướng mua sắm.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#171717] text-white text-xs font-semibold rounded hover:bg-neutral-800 transition-colors shadow-2xs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Thêm danh mục mới
        </button>
      </div>

      {/* Categories Tree Grid */}
      {loading ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center text-xs text-neutral-400 font-mono">
          Đang tải cấu trúc danh mục...
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center text-xs text-neutral-400">
          Chưa có danh mục nào. Hãy bấm &quot;Thêm danh mục mới&quot; để khởi tạo.
        </div>
      ) : (
        <div className="space-y-4">
          {rootCategories.map((root) => {
            const children = categories.filter((c) => {
              const pid = typeof c.parent === 'object' ? (c.parent as any)?._id : c.parent;
              return pid === root._id;
            });

            return (
              <div key={root._id} className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-2xs">
                {/* Parent Row */}
                <div className="p-4 bg-neutral-50/70 border-b border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-neutral-900 text-white flex items-center justify-center font-mono text-xs font-bold">
                      #
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900">{root.name}</h3>
                      <span className="text-[10px] font-mono text-neutral-400">ID: {root._id} • {children.length} danh mục con</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(root)}
                      className="px-2.5 py-1 text-xs border border-neutral-300 rounded hover:bg-white text-neutral-700"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(root._id, root.name)}
                      className="px-2.5 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50"
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                {/* Subcategories list */}
                {children.length > 0 ? (
                  <div className="p-3 pl-8 divide-y divide-neutral-100">
                    {children.map((child) => (
                      <div key={child._id} className="py-2.5 flex items-center justify-between text-xs hover:bg-neutral-50/50 px-2 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400 font-mono">└─</span>
                          <span className="font-medium text-neutral-800">{child.name}</span>
                          <span className="text-[10px] font-mono text-neutral-400">({child._id})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(child)}
                            className="px-2 py-0.5 text-[11px] text-neutral-600 hover:text-neutral-900"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(child._id, child.name)}
                            className="px-2 py-0.5 text-[11px] text-red-600 hover:text-red-700"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 pl-8 text-xs text-neutral-400 italic">
                    Chưa có danh mục con trực thuộc.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900 mb-1">
              {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Nhập tên danh mục và chọn danh mục cha (nếu là phân nhóm thứ cấp).
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Tên danh mục*</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Laptop, Tai nghe Bluetooth..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Danh mục cha (Tùy chọn)</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none bg-white"
                >
                  <option value="">-- Danh mục gốc (Cấp 1) --</option>
                  {rootCategories
                    .filter((c) => !editingCategory || c._id !== editingCategory._id)
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                </select>
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
                  {submitting ? 'Đang lưu...' : 'Lưu danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
