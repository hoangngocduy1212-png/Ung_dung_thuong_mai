import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminShopItem } from '../../types/admin';

const STATUS_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'active', label: 'Đang hoạt động' },
  { key: 'locked', label: 'Đã khóa' },
  { key: 'rejected', label: 'Bị từ chối' },
];

const STATUS_MAP: Record<string, { label: string; badge: string }> = {
  pending: { label: 'Chờ duyệt', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  active: { label: 'Đang hoạt động', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  locked: { label: 'Đã khóa', badge: 'bg-neutral-100 text-neutral-600 border-neutral-300' },
  rejected: { label: 'Bị từ chối', badge: 'bg-red-50 text-red-700 border-red-200' },
};

export const AdminShopsPage: React.FC = () => {
  const [shops, setShops] = useState<AdminShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalShops, setTotalShops] = useState(0);

  // Reject Modal
  const [rejectModalShop, setRejectModalShop] = useState<AdminShopItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Detail Modal
  const [selectedShop, setSelectedShop] = useState<AdminShopItem | null>(null);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { page, limit: 15 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery.trim()) params.q = searchQuery.trim();

      const res = await adminService.getShops(params);
      setShops(res.items || []);
      setTotalShops(res.total || 0);
      setTotalPages(Math.ceil((res.total || 0) / 15) || 1);
    } catch (err: any) {
      console.error('Fetch admin shops error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchShops();
  };

  const handleApprove = async (shopId: string) => {
    const ok = window.confirm('Bạn có chắc muốn phê duyệt cho gian hàng này kinh doanh trên sàn?');
    if (!ok) return;
    try {
      setSubmitting(true);
      await adminService.approveShop(shopId);
      setShops(shops.map((s) => (s._id === shopId ? { ...s, status: 'active' } : s)));
    } catch (err: any) {
      alert(err?.message || 'Không thể phê duyệt gian hàng.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalShop) return;
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối hồ sơ gian hàng.');
      return;
    }
    try {
      setSubmitting(true);
      await adminService.rejectShop(rejectModalShop._id, rejectReason.trim());
      setShops(shops.map((s) => (s._id === rejectModalShop._id ? { ...s, status: 'rejected' } : s)));
      setRejectModalShop(null);
      setRejectReason('');
    } catch (err: any) {
      alert(err?.message || 'Không thể từ chối gian hàng.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLock = async (shop: AdminShopItem) => {
    const isLocking = shop.status === 'active';
    const actionText = isLocking ? 'khóa' : 'mở khóa';
    const ok = window.confirm(`Bạn có chắc muốn ${actionText} gian hàng "${shop.name}" không?`);
    if (!ok) return;

    try {
      setSubmitting(true);
      if (isLocking) {
        await adminService.lockShop(shop._id);
        setShops(shops.map((s) => (s._id === shop._id ? { ...s, status: 'locked' } : s)));
      } else {
        await adminService.unlockShop(shop._id);
        setShops(shops.map((s) => (s._id === shop._id ? { ...s, status: 'active' } : s)));
      }
    } catch (err: any) {
      alert(err?.message || `Không thể ${actionText} gian hàng.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Quản lý Cửa hàng đối tác</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Phê duyệt hồ sơ mở gian hàng, giám sát tình trạng hoạt động và kiểm soát vi phạm ({totalShops} cửa hàng).
          </p>
        </div>
        <button
          onClick={fetchShops}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded hover:bg-neutral-50"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-neutral-200 text-xs font-medium">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatusFilter(tab.key);
              setPage(1);
            }}
            className={`px-3.5 py-2.5 rounded-t transition-colors whitespace-nowrap border-b-2 font-mono ${
              statusFilter === tab.key
                ? 'border-[#171717] text-neutral-900 font-bold bg-neutral-100/50'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-md">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên cửa hàng..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none"
          />
          <svg className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-neutral-900 text-white rounded text-xs font-semibold hover:bg-neutral-800 transition-colors"
        >
          Tìm kiếm
        </button>
      </form>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400 font-mono">Đang tải danh sách gian hàng...</div>
        ) : shops.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">Không tìm thấy gian hàng nào phù hợp.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Tên gian hàng</th>
                  <th className="py-3 px-4">Chủ sở hữu</th>
                  <th className="py-3 px-4">Liên hệ</th>
                  <th className="py-3 px-4">Đánh giá</th>
                  <th className="py-3 px-4">Ngày tham gia</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {shops.map((shop) => {
                  const statusKey = shop.status || 'pending';
                  const statusInfo = STATUS_MAP[statusKey] || { label: statusKey, badge: 'bg-neutral-100 text-neutral-600' };
                  return (
                    <tr key={shop._id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {shop.logo ? (
                            <img src={shop.logo} alt={shop.name} className="w-8 h-8 rounded-lg object-cover border border-neutral-200 shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 font-bold font-mono text-neutral-600">
                              {shop.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-neutral-900 block">{shop.name}</span>
                            {shop.description && (
                              <span className="text-[11px] text-neutral-400 line-clamp-1 max-w-[200px]">{shop.description}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-neutral-900">
                        {shop.owner?.fullName || 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-500">
                        <div>{shop.owner?.email}</div>
                        <div className="text-[10px] text-neutral-400">{shop.owner?.phone}</div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className="text-amber-500 font-semibold">★ {shop.ratingAvg || 5.0}</span>
                        <span className="text-[10px] text-neutral-400 ml-1">({shop.ratingCount || 0})</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-400 text-[11px] whitespace-nowrap">
                        {shop.createdAt ? new Date(shop.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${statusInfo.badge}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {shop.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(shop._id)}
                                disabled={submitting}
                                className="px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-semibold rounded hover:bg-emerald-700 transition-colors"
                              >
                                Phê duyệt
                              </button>
                              <button
                                onClick={() => {
                                  setRejectModalShop(shop);
                                  setRejectReason('');
                                }}
                                disabled={submitting}
                                className="px-2 py-1 text-red-600 border border-red-200 text-[11px] rounded hover:bg-red-50 transition-colors"
                              >
                                Từ chối
                              </button>
                            </>
                          )}
                          {shop.status === 'active' && (
                            <button
                              onClick={() => handleToggleLock(shop)}
                              disabled={submitting}
                              className="px-2.5 py-1 text-red-600 border border-red-200 hover:bg-red-50 text-[11px] font-semibold rounded transition-colors"
                            >
                              Khóa
                            </button>
                          )}
                          {shop.status === 'locked' && (
                            <button
                              onClick={() => handleToggleLock(shop)}
                              disabled={submitting}
                              className="px-2.5 py-1 text-emerald-600 border border-emerald-200 hover:bg-emerald-50 text-[11px] font-semibold rounded transition-colors"
                            >
                              Mở khóa
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedShop(shop)}
                            className="p-1 text-neutral-400 hover:text-neutral-900 rounded hover:bg-neutral-100"
                            title="Xem chi tiết"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 border-t border-neutral-200 text-xs">
            <span className="text-neutral-500 font-mono">
              Trang {page} / {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="px-2.5 py-1 bg-white border border-neutral-300 rounded disabled:opacity-40"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="px-2.5 py-1 bg-white border border-neutral-300 rounded disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Shop Modal */}
      {rejectModalShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900 mb-1">
              Từ chối hồ sơ gian hàng {rejectModalShop.name}
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Vui lòng nhập lý do từ chối để người bán biết và bổ sung thông tin theo quy định.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ví dụ: Thiếu giấy phép kinh doanh, thông tin liên hệ không chính xác..."
              className="w-full p-2.5 text-xs border border-neutral-300 rounded focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setRejectModalShop(null)}
                className="px-3 py-1.5 text-xs border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-100"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={submitting}
                className="px-3 py-1.5 text-xs bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition-colors"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shop Detail Modal */}
      {selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-neutral-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h3 className="text-base font-bold text-neutral-900">Chi tiết Gian hàng</h3>
              <button onClick={() => setSelectedShop(null)} className="text-neutral-400 hover:text-neutral-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-4">
              {selectedShop.logo ? (
                <img src={selectedShop.logo} alt={selectedShop.name} className="w-16 h-16 rounded-xl object-cover border border-neutral-200" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-xl font-mono text-neutral-600">
                  {selectedShop.name.charAt(0)}
                </div>
              )}
              <div>
                <h4 className="text-lg font-bold text-neutral-900">{selectedShop.name}</h4>
                <div className="text-neutral-500 font-mono mt-0.5">Mã ID: {selectedShop._id}</div>
                <div className="mt-1">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                    STATUS_MAP[selectedShop.status || 'pending']?.badge || 'bg-neutral-100'
                  }`}>
                    {STATUS_MAP[selectedShop.status || 'pending']?.label || selectedShop.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <div>
                <span className="text-neutral-400 block font-mono text-[10px] uppercase">Chủ sở hữu</span>
                <span className="font-semibold text-neutral-800">{selectedShop.owner?.fullName}</span>
                <span className="text-neutral-500 font-mono ml-2">({selectedShop.owner?.email} • {selectedShop.owner?.phone})</span>
              </div>
              <div>
                <span className="text-neutral-400 block font-mono text-[10px] uppercase">Mô tả</span>
                <p className="text-neutral-700 bg-neutral-50 p-2.5 rounded border border-neutral-100 mt-1">
                  {selectedShop.description || 'Chưa cập nhật mô tả.'}
                </p>
              </div>
              {selectedShop.rejectReason && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700">
                  <span className="font-bold block">Lý do từ chối:</span>
                  {selectedShop.rejectReason}
                </div>
              )}
            </div>
            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <button
                onClick={() => setSelectedShop(null)}
                className="px-4 py-1.5 border border-neutral-300 rounded text-neutral-700 font-medium hover:bg-neutral-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
