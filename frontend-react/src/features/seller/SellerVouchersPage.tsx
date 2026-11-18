import React, { useEffect, useState } from 'react';
import { sellerService } from '../../services/sellerService';
import type { SellerVoucher } from '../../types/seller';

export const SellerVouchersPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<SellerVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Create Form State
  const [form, setForm] = useState({
    code: '',
    title: '',
    amount: 50000,
    minOrder: 200000,
    quantity: 50,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await sellerService.getVouchers();
      setVouchers(res || []);
    } catch (err: any) {
      console.error('Fetch seller vouchers error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.title.trim()) {
      alert('Vui lòng nhập đầy đủ mã và tiêu đề voucher.');
      return;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      alert('Ngày kết thúc phải sau ngày bắt đầu.');
      return;
    }

    try {
      setSubmitting(true);
      const newVoucher = await sellerService.createVoucher({
        code: form.code.toUpperCase().trim(),
        title: form.title.trim(),
        scope: 'shop',
        amount: Number(form.amount),
        minOrder: Number(form.minOrder),
        quantity: Number(form.quantity),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        active: true,
      });
      setVouchers([newVoucher, ...vouchers]);
      setShowCreateModal(false);
      setForm({
        code: '',
        title: '',
        amount: 50000,
        minOrder: 200000,
        quantity: 50,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    } catch (err: any) {
      alert(err?.message || 'Không thể tạo mã giảm giá.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVoucher = async (voucherId: string) => {
    const ok = window.confirm('Bạn có chắc muốn xóa mã giảm giá này không?');
    if (!ok) return;
    try {
      await sellerService.deleteVoucher(voucherId);
      setVouchers(vouchers.filter((v) => v._id !== voucherId));
    } catch (err: any) {
      alert(err?.message || 'Không thể xóa voucher.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Mã giảm giá cửa hàng</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Tạo và quản lý các chương trình ưu đãi, voucher áp dụng riêng cho gian hàng của bạn.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5C00] text-white text-xs font-semibold rounded hover:bg-[#E04E00] transition-colors shadow-2xs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Tạo mã mới
        </button>
      </div>

      {/* Vouchers Grid / Table */}
      {loading ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center text-xs text-neutral-400 font-mono">
          Đang tải danh sách voucher...
        </div>
      ) : vouchers.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center text-xs text-neutral-400">
          Chưa có mã giảm giá nào. Hãy nhấn &quot;Tạo mã mới&quot; để thiết lập ưu đãi cho người mua.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vouchers.map((voucher) => {
            const isExpired = new Date(voucher.endDate) < new Date();
            const claimed = voucher.quantity - voucher.remaining;
            return (
              <div
                key={voucher._id}
                className="bg-white border border-neutral-200 rounded-lg p-4 shadow-2xs relative flex flex-col justify-between hover:border-neutral-400 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 font-mono text-xs font-bold tracking-wider bg-neutral-100 text-neutral-900 rounded border border-neutral-200">
                      {voucher.code}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        isExpired
                          ? 'bg-neutral-100 text-neutral-500'
                          : voucher.active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {isExpired ? 'Hết hạn' : voucher.active ? 'Đang chạy' : 'Đã dừng'}
                    </span>
                  </div>

                  <h3 className="font-semibold text-neutral-900 text-sm mb-1">{voucher.title}</h3>
                  <div className="text-xl font-bold font-mono text-[#FF5C00] mb-3">
                    -{voucher.amount.toLocaleString('vi-VN')}₫
                  </div>

                  <div className="space-y-1.5 text-[11px] text-neutral-600 border-t border-neutral-100 pt-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Đơn tối thiểu:</span>
                      <span className="font-mono font-medium">{voucher.minOrder.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Lượt sử dụng:</span>
                      <span className="font-mono">
                        {claimed} / {voucher.quantity} (còn {voucher.remaining})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Thời hạn:</span>
                      <span className="font-mono text-[10px]">
                        {new Date(voucher.startDate).toLocaleDateString('vi-VN')} -{' '}
                        {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-neutral-100 flex justify-end">
                  <button
                    onClick={() => handleDeleteVoucher(voucher._id)}
                    className="text-[11px] text-red-600 hover:text-red-700 font-medium"
                  >
                    Xóa voucher
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Voucher Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-neutral-900">Tạo mã giảm giá mới</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Mã Voucher (viết hoa, không dấu)*</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="VD: TECH50K, SHOPWELCOME"
                  className="w-full px-3 py-2 border border-neutral-300 rounded font-mono font-bold focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Tên chương trình / Tiêu đề*</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="VD: Giảm 50K cho đơn từ 200K"
                  className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Mức giảm (VNĐ)*</label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    required
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded font-mono focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Đơn tối thiểu (VNĐ)*</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={form.minOrder}
                    onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded font-mono focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Số lượng phát hành*</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded font-mono focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Ngày bắt đầu*</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Ngày kết thúc*</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#FF5C00] text-white font-semibold rounded hover:bg-[#E04E00] disabled:opacity-50"
                >
                  {submitting ? 'Đang tạo...' : 'Tạo voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
