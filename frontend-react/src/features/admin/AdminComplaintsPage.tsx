import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { Complaint } from '../../types/customer';

export const AdminComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('chuyen_admin');
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [decisionResult, setDecisionResult] = useState('');
  const [forceRefund, setForceRefund] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await adminService.getComplaints({ status: statusFilter });
      setComplaints(res.items || []);
    } catch (err: any) {
      console.error('Fetch complaints error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const handleOpenResolve = (comp: Complaint) => {
    setActiveComplaint(comp);
    setDecisionResult('');
    setForceRefund(false);
  };

  const handleSubmitResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;
    if (!decisionResult.trim() || decisionResult.trim().length < 3) {
      alert('Vui lòng nhập phán quyết tối thiểu 3 ký tự.');
      return;
    }

    try {
      setSubmitting(true);
      await adminService.resolveComplaint(activeComplaint._id, {
        result: decisionResult.trim(),
        forceRefund,
      });
      setActiveComplaint(null);
      fetchComplaints();
    } catch (err: any) {
      alert(err?.message || 'Không thể ghi nhận phán quyết khiếu nại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Trọng tài Tranh chấp Khiếu nại</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Phán quyết chung cuộc các vụ việc tranh chấp giữa người mua và gian hàng do CSKH chuyển lên cấp quản trị.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[
            { key: 'chuyen_admin', label: 'Chờ Admin phân xử' },
            { key: 'da_xu_ly', label: 'Đã giải quyết' },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setStatusFilter(st.key)}
              className={`px-3 py-1.5 rounded text-xs font-medium font-mono transition-colors ${
                statusFilter === st.key
                  ? 'bg-neutral-900 text-white font-bold'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400 font-mono">Đang tải danh sách tranh chấp...</div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">
            {statusFilter === 'chuyen_admin'
              ? 'Tuyệt vời! Không có khiếu nại nào đang tồn đọng chờ phân xử.'
              : 'Chưa có hồ sơ khiếu nại nào đã xử lý.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Mã khiếu nại</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Tiêu đề khiếu nại</th>
                  <th className="py-3 px-4">Nội dung</th>
                  <th className="py-3 px-4">Chuyển lên lúc</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                      {c.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-800">
                      {(c as any).customer?.fullName || 'Khách hàng'}
                    </td>
                    <td className="py-3 px-4 font-medium text-neutral-900 max-w-xs">
                      {c.title || `Khiếu nại đơn ${c.orderCode}`}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 max-w-sm">
                      <p className="line-clamp-2">{c.content || c.reason}</p>
                      {c.result && (
                        <div className="text-[10px] text-emerald-700 bg-emerald-50 p-1.5 rounded mt-1 border border-emerald-100">
                          Phán quyết: {c.result}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-400 text-[11px] whitespace-nowrap">
                      {c.escalatedAt ? new Date(c.escalatedAt).toLocaleString('vi-VN') : new Date(c.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${
                        c.status === 'chuyen_admin'
                          ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {c.status === 'chuyen_admin' ? 'Chờ Admin' : 'Đã phán quyết'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {c.status === 'chuyen_admin' ? (
                        <button
                          onClick={() => handleOpenResolve(c)}
                          className="px-3 py-1 bg-[#171717] text-white text-[11px] font-semibold rounded hover:bg-neutral-800 transition-colors"
                        >
                          Phán quyết
                        </button>
                      ) : (
                        <span className="text-[11px] text-neutral-400 font-mono">Đã xong</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {activeComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-neutral-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase">Trọng tài phân xử</span>
                <h3 className="text-base font-bold text-neutral-900 font-mono">{activeComplaint.code}</h3>
              </div>
              <button onClick={() => setActiveComplaint(null)} className="text-neutral-400 hover:text-neutral-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-3 bg-neutral-50 rounded border border-neutral-100 space-y-1">
              <div className="font-bold text-neutral-900">{activeComplaint.title || `Khiếu nại đơn ${activeComplaint.orderCode}`}</div>
              <p className="text-neutral-600">{activeComplaint.content || activeComplaint.reason}</p>
            </div>

            <form onSubmit={handleSubmitResolve} className="space-y-4">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Phán quyết của Quản trị viên (Admin Ruling)*
                </label>
                <textarea
                  rows={4}
                  required
                  value={decisionResult}
                  onChange={(e) => setDecisionResult(e.target.value)}
                  placeholder="Ghi rõ kết luận giải quyết, căn cứ phán quyết và trách nhiệm của các bên..."
                  className="w-full p-2.5 text-xs border border-neutral-300 rounded focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none"
                />
              </div>

              <div className="p-3 bg-red-50/60 rounded border border-red-200/80">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forceRefund}
                    onChange={(e) => setForceRefund(e.target.checked)}
                    className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <span className="font-bold text-red-900 block">Ép lệnh hoàn tiền đơn hàng (Force Refund)</span>
                    <span className="text-[11px] text-red-700">
                      Tự động hoàn tiền từ tài khoản người bán về ví/tài khoản khách hàng (áp dụng khi đơn hàng đã giao thành công và có bằng chứng vi phạm).
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setActiveComplaint(null)}
                  className="px-3.5 py-1.5 border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-[#171717] text-white font-semibold rounded hover:bg-neutral-800 disabled:opacity-50"
                >
                  {submitting ? 'Đang gửi...' : 'Ban hành phán quyết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
