import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { PlatformVoucher } from '../../types/catalog';

export const AdminVouchersPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<PlatformVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    code: '',
    title: '',
    amount: 100000,
    minOrder: 500000,
    quantity: 100,
    pointsCost: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getVouchers();
      setVouchers(res || []);
    } catch (err: any) {
      console.error('Fetch admin vouchers error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
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
      await adminService.createVoucher({
        code: form.code.toUpperCase().trim(),
        title: form.title.trim(),
        amount: Number(form.amount),
        minOrder: Number(form.minOrder),
        quantity: Number(form.quantity),
        pointsCost: Number(form.pointsCost),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      });
      setShowModal(false);
      setForm({
        code: '',
        title: '',
        amount: 100000,
        minOrder: 500000,
        quantity: 100,
        pointsCost: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      fetchVouchers();
    } catch (err: any) {
      alert(err?.message || 'Không thể tạo mã voucher sàn.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    const ok = window.confirm(`Bạn có chắc muốn xóa mã voucher "${code}" không?`);
    if (!ok) return;

    try {
      await adminService.deleteVoucher(id);
      fetchVouchers();
    } catch (err: any) {
      alert(err?.message || 'Không thể xóa voucher.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Voucher Khuyến mại Toàn sàn</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Thiết lập các mã ưu đãi trợ giá bởi TECHSTORE hoặc chương trình đổi điểm tích lũy ({vouchers.length} mã).
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5C00] text-white text-xs font-semibold rounded hover:bg-[#E04E00] transition-colors shadow-2xs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Tạo Voucher Toàn sàn
        </button>
      </div>

      {/* Grid of Vouchers */}
      {loading ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center text-xs text-neutral-400 font-mono">
          Đang tải danh sách voucher...
        </div>
      ) : vouchers.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center text-xs text-neutral-400">
          Chưa có voucher toàn sàn nào. Hãy nhấn &quot;Tạo Voucher Toàn sàn&quot; để thiết lập.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vouchers.map((v) => {
            const isExpired = new Date(v.endDate) < new Date();
            const totalQty = v.quantity || v.remaining;
            const claimed = totalQty - v.remaining;

            return (
              <div
                key={v._id}
                className="bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between hover:border-neutral-400 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 font-mono text-xs font-bold tracking-wider bg-neutral-900 text-white rounded">
                      {v.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {v.pointsCost && v.pointsCost > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          {v.pointsCost} PTS
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          FREE
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          isExpired
                            ? 'bg-neutral-100 text-neutral-400'
                            : v.active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {isExpired ? 'Hết hạn' : v.active ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-neutral-900 mb-1">{v.title}</h3>
                  <div className="text-xl font-bold font-mono text-[#FF5C00] mb-3">
                    -{v.amount.toLocaleString('vi-VN')}₫
                  </div>

                  <div className="space-y-1.5 text-[11px] text-neutral-600 border-t border-neutral-100 pt-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Đơn tối thiểu:</span>
                      <span className="font-mono font-semibold text-neutral-800">{v.minOrder.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Lượt cấp phát:</span>
                      <span className="font-mono">
                        {claimed} / {totalQty} (còn {v.remaining})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Hiệu lực:</span>
                      <span className="font-mono text-[10px]">
                        {new Date(v.startDate).toLocaleDateString('vi-VN')} -{' '}
                        {new Date(v.endDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-neutral-100 flex justify-end">
                  <button
                    onClick={() => handleDelete(v._id, v.code)}
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

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-neutral-900">Tạo Voucher Sàn Mới</h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-700 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Mã Voucher*</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="VD: TECHGLOBAL, BLACKFRIDAY"
                  className="w-full px-3 py-2 border border-neutral-300 rounded font-mono font-bold focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Tiêu đề chương trình*</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="VD: Đại tiệc công nghệ giảm 100K"
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

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Điểm đổi (0 = Miễn phí)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.pointsCost}
                    onChange={(e) => setForm({ ...form, pointsCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded font-mono focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none"
                  />
                </div>
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
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#FF5C00] text-white font-semibold rounded hover:bg-[#E04E00] disabled:opacity-50"
                >
                  {submitting ? 'Đang tạo...' : 'Tạo Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
