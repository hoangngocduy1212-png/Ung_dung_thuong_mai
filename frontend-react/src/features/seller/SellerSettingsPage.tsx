import React, { useEffect, useState } from 'react';
import { sellerService } from '../../services/sellerService';
import type { SellerShop } from '../../types/seller';

export const SellerSettingsPage: React.FC = () => {
  const [shop, setShop] = useState<SellerShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [form, setForm] = useState({
    logo: '',
    description: '',
    policy: '',
  });

  const fetchShop = async () => {
    try {
      setLoading(true);
      const res = await sellerService.getShop();
      setShop(res);
      setForm({
        logo: res.logo || '',
        description: res.description || '',
        policy: (res as any).policy || '',
      });
    } catch (err: any) {
      console.error('Fetch shop error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShop();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveSuccess(false);
      const updated = await sellerService.updateShop({
        logo: form.logo.trim() || undefined,
        description: form.description.trim() || undefined,
        ...((form.policy.trim() ? { policy: form.policy.trim() } : {}) as any),
      });
      setShop(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err?.message || 'Không thể lưu cài đặt gian hàng.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center text-xs text-neutral-400 font-mono">
        Đang tải thông tin cửa hàng...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Cài đặt gian hàng</h1>
        <p className="text-xs text-neutral-500 mt-1">
          Quản lý thông tin thương hiệu, hình ảnh đại diện và chính sách dịch vụ của cửa hàng.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Đã lưu cập nhật thông tin cửa hàng thành công.
        </div>
      )}

      {/* General Store Card */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-2xs space-y-6">
        <div className="flex items-start gap-5 pb-6 border-b border-neutral-100">
          <div className="w-20 h-20 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center shrink-0">
            {form.logo ? (
              <img src={form.logo} alt={shop?.name} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            )}
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Tên gian hàng (cố định)</span>
            <h2 className="text-xl font-bold text-neutral-900 mt-0.5">{shop?.name}</h2>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-semibold ${
                shop?.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {shop?.status === 'active' ? 'Đang hoạt động' : 'Chờ duyệt'}
              </span>
              <span className="text-neutral-400">•</span>
              <span className="text-neutral-500 font-mono text-[11px]">Đánh giá: ★ {shop?.ratingAvg || 5.0}</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-neutral-700 mb-1">Đường dẫn Logo (URL)</label>
            <input
              type="url"
              value={form.logo}
              onChange={(e) => setForm({ ...form, logo: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none font-mono"
            />
            <p className="text-[11px] text-neutral-400 mt-1">Khuyến nghị kích thước vuông 400x400px hoặc 500x500px.</p>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Mô tả gian hàng</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Giới thiệu về gian hàng, triết lý phục vụ, cam kết chất lượng..."
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Chính sách bảo hành &amp; Đổi trả riêng</label>
            <textarea
              rows={4}
              value={form.policy}
              onChange={(e) => setForm({ ...form, policy: e.target.value })}
              placeholder="Quy định đổi trả và bảo hành đặc thù của gian hàng áp dụng cho khách hàng..."
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none"
            />
          </div>

          <div className="pt-4 border-t border-neutral-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#171717] text-white text-xs font-semibold rounded hover:bg-neutral-800 disabled:opacity-50 transition-colors shadow-2xs"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
