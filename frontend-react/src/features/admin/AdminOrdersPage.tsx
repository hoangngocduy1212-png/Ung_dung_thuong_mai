import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { Order, OrderStatus } from '../../types/order';

const STATUS_MAP: Record<OrderStatus, { label: string; badgeClass: string }> = {
  cho_xac_nhan: { label: 'Chờ xác nhận', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  da_xac_nhan: { label: 'Đã xác nhận', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  dang_giao: { label: 'Đang vận chuyển', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
  da_giao: { label: 'Đã giao hàng', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  hoan_tat: { label: 'Hoàn tất', badgeClass: 'bg-green-50 text-green-700 border-green-200' },
  da_huy: { label: 'Đã hủy', badgeClass: 'bg-red-50 text-red-700 border-red-200' },
  da_tra_hang: { label: 'Đã trả hàng', badgeClass: 'bg-neutral-100 text-neutral-700 border-neutral-300' },
};

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { page, limit: 15 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery.trim()) params.q = searchQuery.trim();

      const res = await adminService.getOrders(params);
      setOrders(res.items || []);
      setTotalOrders(res.total || 0);
      setTotalPages(Math.ceil((res.total || 0) / 15) || 1);
    } catch (err: any) {
      console.error('Fetch admin orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Giám sát Đơn hàng Toàn sàn</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Theo dõi dòng giao dịch, trạng thái hoàn tất và luân chuyển hàng hóa của tất cả các gian hàng ({totalOrders} đơn).
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded hover:bg-neutral-50"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-neutral-200 text-xs font-medium">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'cho_xac_nhan', label: 'Chờ xác nhận' },
          { key: 'da_xac_nhan', label: 'Đã xác nhận' },
          { key: 'dang_giao', label: 'Đang giao' },
          { key: 'da_giao', label: 'Đã giao' },
          { key: 'hoan_tat', label: 'Hoàn tất' },
          { key: 'da_huy', label: 'Đã hủy' },
        ].map((tab) => (
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
            placeholder="Tìm theo mã đơn ORD-..."
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
          <div className="p-12 text-center text-xs text-neutral-400 font-mono">Đang tải danh sách đơn hàng...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">Không tìm thấy đơn hàng nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Mã đơn hàng</th>
                  <th className="py-3 px-4">Gian hàng</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Ngày tạo</th>
                  <th className="py-3 px-4 text-right">Tổng thanh toán</th>
                  <th className="py-3 px-4">Thanh toán</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((o) => {
                  const statusInfo = STATUS_MAP[o.status] || { label: o.status, badgeClass: 'bg-neutral-100 text-neutral-600' };
                  const shopName = typeof o.shop === 'object' ? (o.shop as any)?.name : 'N/A';
                  const customerName = typeof o.customer === 'object' ? (o.customer as any)?.fullName : (o.shippingAddress?.fullName || o.shippingAddress?.receiver || 'N/A');

                  return (
                    <tr key={o._id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                        {o.code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-800">
                        {shopName}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-neutral-900">{customerName}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{o.shippingAddress?.phone}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-400 text-[11px] whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                        <div className="text-[10px]">{new Date(o.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 whitespace-nowrap">
                        {o.total.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                          o.payment?.method === 'cod' ? 'bg-neutral-100 text-neutral-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {o.payment?.method === 'cod' ? 'COD' : 'Online'}
                        </span>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          {o.payment?.status === 'paid' ? 'Đã TT' : 'Chưa TT'}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-1 text-neutral-400 hover:text-neutral-900 rounded hover:bg-neutral-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
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

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-neutral-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase">Chi tiết đơn hàng sàn</span>
                <h3 className="text-base font-bold text-neutral-900 font-mono">{selectedOrder.code}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 hover:text-neutral-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded border border-neutral-100">
                <div>
                  <span className="text-neutral-400 block font-mono text-[10px] uppercase">Trạng thái</span>
                  <span className="font-bold text-neutral-900">{STATUS_MAP[selectedOrder.status]?.label || selectedOrder.status}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-mono text-[10px] uppercase">Tổng tiền</span>
                  <span className="font-bold font-mono text-[#FF5C00]">{selectedOrder.total.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>

              <div>
                <span className="text-neutral-400 block font-mono text-[10px] uppercase mb-1">Địa chỉ giao nhận</span>
                <div className="p-3 bg-neutral-50 rounded border border-neutral-100">
                  <div className="font-semibold text-neutral-900">{selectedOrder.shippingAddress?.fullName} • {selectedOrder.shippingAddress?.phone}</div>
                  <div className="text-neutral-600 mt-0.5">
                    {selectedOrder.shippingAddress?.detail}, {selectedOrder.shippingAddress?.district}, {selectedOrder.shippingAddress?.province}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-neutral-400 block font-mono text-[10px] uppercase mb-1">Sản phẩm trong đơn</span>
                <div className="border border-neutral-200 rounded divide-y divide-neutral-100">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {it.image && <img src={it.image} alt={it.name} className="w-8 h-8 rounded object-cover border" />}
                        <div>
                          <div className="font-medium text-neutral-900">{it.name}</div>
                          {it.variantName && <div className="text-[10px] text-neutral-400">Phân loại: {it.variantName}</div>}
                        </div>
                      </div>
                      <div className="text-right font-mono font-medium">
                        {it.price.toLocaleString('vi-VN')}₫ × {it.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
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
