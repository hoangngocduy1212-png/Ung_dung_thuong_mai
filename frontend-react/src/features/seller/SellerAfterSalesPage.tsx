import React, { useEffect, useState } from 'react';
import { sellerService } from '../../services/sellerService';
import type { SellerAfterSales } from '../../types/seller';

const TYPE_MAP: Record<string, { label: string; badge: string }> = {
  huy_don: { label: 'Hủy đơn hàng', badge: 'bg-red-50 text-red-700 border-red-200' },
  hoan_tien: { label: 'Yêu cầu hoàn tiền', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  doi_hang: { label: 'Yêu cầu đổi hàng', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
};

const STATUS_MAP: Record<string, { label: string; badge: string }> = {
  cho_xu_ly: { label: 'Chờ xử lý', badge: 'bg-amber-50 text-amber-700' },
  da_chap_nhan: { label: 'Đã chấp thuận', badge: 'bg-emerald-50 text-emerald-700' },
  bi_tu_choi: { label: 'Đã từ chối', badge: 'bg-red-50 text-red-700' },
};

export const SellerAfterSalesPage: React.FC = () => {
  const [items, setItems] = useState<SellerAfterSales[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Handle Modal State
  const [activeItem, setActiveItem] = useState<SellerAfterSales | null>(null);
  const [decision, setDecision] = useState<'accept' | 'reject'>('accept');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAfterSales = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : undefined;
      const res = await sellerService.getAfterSales(params);
      setItems(res || []);
    } catch (err: any) {
      console.error('Fetch seller after-sales error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAfterSales();
  }, [statusFilter]);

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;
    if (!note.trim() || note.trim().length < 3) {
      alert('Vui lòng nhập ghi chú phản hồi tối thiểu 3 ký tự.');
      return;
    }

    try {
      setSubmitting(true);
      const updated = await sellerService.handleAfterSales(activeItem._id, {
        decision,
        note: note.trim(),
      });
      setItems(items.map((i) => (i._id === activeItem._id ? updated : i)));
      setActiveItem(null);
      setNote('');
    } catch (err: any) {
      alert(err?.message || 'Không thể xử lý yêu cầu hậu mãi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Hậu mãi &amp; Khiếu nại</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Xử lý các yêu cầu hủy đơn, hoàn tiền và đổi trả hàng từ phía người mua.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {['all', 'cho_xu_ly', 'da_chap_nhan', 'bi_tu_choi'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded text-xs font-medium font-mono transition-colors ${
                statusFilter === st
                  ? 'bg-neutral-900 text-white font-bold'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {st === 'all'
                ? 'Tất cả'
                : st === 'cho_xu_ly'
                ? 'Chờ xử lý'
                : st === 'da_chap_nhan'
                ? 'Đã duyệt'
                : 'Đã từ chối'}
            </button>
          ))}
        </div>
      </div>

      {/* Table of AfterSales */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400 font-mono">
            Đang tải dữ liệu yêu cầu hậu mãi...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">
            Không có yêu cầu hậu mãi nào trong danh sách.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Loại yêu cầu</th>
                  <th className="py-3 px-4">Mã đơn hàng</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Lý do</th>
                  <th className="py-3 px-4">Ngày gửi</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((item) => {
                  const typeInfo = TYPE_MAP[item.type] || { label: item.type, badge: 'bg-neutral-100 text-neutral-700' };
                  const statusInfo = STATUS_MAP[item.status] || { label: item.status, badge: 'bg-neutral-100 text-neutral-700' };
                  const orderCode = typeof item.order === 'object' ? item.order?.code : item.order;

                  return (
                    <tr key={item._id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${typeInfo.badge}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                        {orderCode || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900">{item.customer?.fullName}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">{item.customer?.phone}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-neutral-700 line-clamp-2">{item.reason}</p>
                        {item.sellerNote && (
                          <div className="text-[10px] text-neutral-500 mt-1 italic">
                            Phản hồi: {item.sellerNote}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-neutral-400 whitespace-nowrap font-mono text-[11px]">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${statusInfo.badge}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {item.status === 'cho_xu_ly' ? (
                          <button
                            onClick={() => {
                              setActiveItem(item);
                              setDecision('accept');
                              setNote('');
                            }}
                            className="px-3 py-1 bg-[#171717] text-white text-[11px] font-semibold rounded hover:bg-neutral-800 transition-colors"
                          >
                            Xử lý
                          </button>
                        ) : (
                          <span className="text-[11px] text-neutral-400 font-mono">Đã đóng</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900 mb-1">
              Xử lý yêu cầu {TYPE_MAP[activeItem.type]?.label || activeItem.type}
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Khách hàng: <span className="font-semibold text-neutral-800">{activeItem.customer?.fullName}</span>.
              <br />
              Lý do: &quot;{activeItem.reason}&quot;
            </p>

            <form onSubmit={handleSubmitDecision} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-2">Quyết định xử lý*</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-center gap-2 p-3 rounded border cursor-pointer font-semibold ${
                      decision === 'accept'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-neutral-200 bg-white text-neutral-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="accept"
                      checked={decision === 'accept'}
                      onChange={() => setDecision('accept')}
                      className="sr-only"
                    />
                    <span>✓ Chấp thuận</span>
                  </label>
                  <label
                    className={`flex items-center justify-center gap-2 p-3 rounded border cursor-pointer font-semibold ${
                      decision === 'reject'
                        ? 'border-red-600 bg-red-50 text-red-800'
                        : 'border-neutral-200 bg-white text-neutral-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="reject"
                      checked={decision === 'reject'}
                      onChange={() => setDecision('reject')}
                      className="sr-only"
                    />
                    <span>✗ Từ chối</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Ghi chú phản hồi cho khách hàng*</label>
                <textarea
                  rows={3}
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi rõ lý do chấp thuận hoặc từ chối để thông báo tới khách hàng..."
                  className="w-full p-2.5 text-xs border border-neutral-300 rounded focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="px-3 py-1.5 border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-1.5 font-semibold text-white rounded transition-colors ${
                    decision === 'accept' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {submitting ? 'Đang gửi...' : 'Xác nhận xử lý'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
