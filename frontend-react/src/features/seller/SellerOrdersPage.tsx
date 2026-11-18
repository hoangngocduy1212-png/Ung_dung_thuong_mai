import React, { useEffect, useState } from 'react';
import { sellerService } from '../../services/sellerService';
import type { Order, OrderStatus } from '../../types/order';

const STATUS_TABS: Array<{ key: string; label: string; countKey?: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'cho_xac_nhan', label: 'Chờ xác nhận' },
  { key: 'da_xac_nhan', label: 'Đã xác nhận' },
  { key: 'dang_giao', label: 'Đang giao' },
  { key: 'da_giao', label: 'Đã giao' },
  { key: 'hoan_tat', label: 'Hoàn tất' },
  { key: 'da_huy', label: 'Đã hủy' },
];

const STATUS_MAP: Record<OrderStatus, { label: string; badgeClass: string }> = {
  cho_xac_nhan: { label: 'Chờ xác nhận', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  da_xac_nhan: { label: 'Đã xác nhận', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  dang_giao: { label: 'Đang vận chuyển', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
  da_giao: { label: 'Đã giao hàng', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  hoan_tat: { label: 'Hoàn tất', badgeClass: 'bg-green-50 text-green-700 border-green-200' },
  da_huy: { label: 'Đã hủy', badgeClass: 'bg-red-50 text-red-700 border-red-200' },
  da_tra_hang: { label: 'Đã trả hàng', badgeClass: 'bg-neutral-100 text-neutral-700 border-neutral-300' },
};

export const SellerOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Selected Order for detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Reject order modal
  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { page, limit: 15 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery.trim()) params.q = searchQuery.trim();

      const res = await sellerService.getOrders(params);
      setOrders(res.items || []);
      setTotalOrders(res.total || 0);
      setTotalPages(Math.ceil((res.total || 0) / 15) || 1);
    } catch (err: any) {
      console.error('Fetch seller orders error:', err);
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

  const handleUpdateStatus = async (orderId: string, nextStatus: 'da_xac_nhan' | 'dang_giao' | 'da_giao') => {
    try {
      setSubmittingAction(true);
      const updated = await sellerService.updateOrderStatus(orderId, nextStatus);
      setOrders(orders.map((o) => (o._id === orderId ? updated : o)));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      alert(err?.message || 'Không thể cập nhật trạng thái đơn hàng.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalOrder) return;
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối đơn hàng.');
      return;
    }
    try {
      setSubmittingAction(true);
      const updated = await sellerService.rejectOrder(rejectModalOrder._id, rejectReason.trim());
      setOrders(orders.map((o) => (o._id === rejectModalOrder._id ? updated : o)));
      setRejectModalOrder(null);
      setRejectReason('');
    } catch (err: any) {
      alert(err?.message || 'Không thể từ chối đơn hàng.');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Quản lý đơn hàng</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Theo dõi, xử lý và cập nhật tiến trình đơn hàng của khách hàng ({totalOrders} đơn).
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded hover:bg-neutral-50 transition-colors"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </button>
      </div>

      {/* Tabs */}
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

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-md">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã đơn (ORD-...)..."
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

      {/* Orders Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400 font-mono">Đang tải danh sách đơn hàng...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">Không tìm thấy đơn hàng nào phù hợp.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Mã đơn hàng</th>
                  <th className="py-3 px-4">Ngày đặt</th>
                  <th className="py-3 px-4">Người nhận</th>
                  <th className="py-3 px-4">Sản phẩm</th>
                  <th className="py-3 px-4 text-right">Tổng tiền</th>
                  <th className="py-3 px-4">Thanh toán</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((order) => {
                  const statusInfo = STATUS_MAP[order.status] || { label: order.status, badgeClass: 'bg-neutral-100 text-neutral-600' };
                  return (
                    <tr key={order._id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                        {order.code}
                      </td>
                      <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        <div className="text-[10px] text-neutral-400">
                          {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900">{order.shippingAddress?.fullName || order.shippingAddress?.receiver}</div>
                        <div className="text-[11px] text-neutral-500">{order.shippingAddress?.phone}</div>
                        <div className="text-[10px] text-neutral-400 line-clamp-1 max-w-[180px]">
                          {order.shippingAddress?.detail}, {order.shippingAddress?.district}, {order.shippingAddress?.province}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1 max-w-[220px]">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              {item.image ? (
                                <img src={item.image} alt={item.name || item.productName} className="w-7 h-7 object-cover rounded border border-neutral-200 shrink-0" />
                              ) : (
                                <div className="w-7 h-7 bg-neutral-100 rounded border border-neutral-200 shrink-0" />
                              )}
                              <div className="line-clamp-1 text-[11px]">
                                <span className="font-medium text-neutral-900">{item.name || item.productName}</span>
                                <span className="text-neutral-400 ml-1 font-mono">x{item.quantity}</span>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-[10px] text-neutral-400 pl-9 font-mono">
                              +{order.items.length - 2} sản phẩm khác
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 whitespace-nowrap">
                        {order.total.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                          order.payment?.method === 'cod' ? 'bg-neutral-100 text-neutral-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {order.payment?.method === 'cod' ? 'COD' : 'Online'}
                        </span>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          {order.payment?.status === 'paid' ? 'Đã TT' : 'Chưa TT'}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {order.status === 'cho_xac_nhan' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(order._id, 'da_xac_nhan')}
                                disabled={submittingAction}
                                className="px-2.5 py-1 bg-[#171717] text-white text-[11px] font-semibold rounded hover:bg-neutral-800 transition-colors"
                              >
                                Xác nhận
                              </button>
                              <button
                                onClick={() => {
                                  setRejectModalOrder(order);
                                  setRejectReason('');
                                }}
                                disabled={submittingAction}
                                className="px-2 py-1 text-red-600 border border-red-200 text-[11px] rounded hover:bg-red-50 transition-colors"
                              >
                                Từ chối
                              </button>
                            </>
                          )}
                          {order.status === 'da_xac_nhan' && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'dang_giao')}
                              disabled={submittingAction}
                              className="px-2.5 py-1 bg-[#FF5C00] text-white text-[11px] font-semibold rounded hover:bg-[#E04E00] transition-colors"
                            >
                              Giao ĐVVC
                            </button>
                          )}
                          {order.status === 'dang_giao' && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'da_giao')}
                              disabled={submittingAction}
                              className="px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-semibold rounded hover:bg-emerald-700 transition-colors"
                            >
                              Đã giao xong
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100 transition-colors"
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-neutral-200">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Chi tiết đơn hàng</span>
                <h3 className="text-base font-bold text-neutral-900 font-mono">{selectedOrder.code}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-6 text-xs">
              {/* Status Banner */}
              <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded border border-neutral-200">
                <div>
                  <span className="text-[10px] text-neutral-500 font-mono uppercase block">Trạng thái hiện tại</span>
                  <span className="font-bold text-neutral-900 text-sm">
                    {STATUS_MAP[selectedOrder.status]?.label || selectedOrder.status}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-500 font-mono uppercase block">Thời gian tạo</span>
                  <span className="font-mono text-neutral-700">
                    {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>

              {/* Recipient Information */}
              <div>
                <h4 className="font-bold text-neutral-900 uppercase font-mono text-[11px] mb-2 tracking-wider">Thông tin giao hàng</h4>
                <div className="bg-neutral-50/70 p-3.5 rounded border border-neutral-100 space-y-1">
                  <div className="font-semibold text-neutral-900">{selectedOrder.shippingAddress?.fullName || selectedOrder.shippingAddress?.receiver}</div>
                  <div className="text-neutral-600 font-mono">{selectedOrder.shippingAddress?.phone}</div>
                  <div className="text-neutral-500">
                    {selectedOrder.shippingAddress?.detail}, {selectedOrder.shippingAddress?.district}, {selectedOrder.shippingAddress?.province}
                  </div>
                  {selectedOrder.shippingAddress?.note && (
                    <div className="text-amber-800 bg-amber-50 p-2 rounded mt-2 border border-amber-200 text-[11px]">
                      Ghi chú: {selectedOrder.shippingAddress.note}
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-neutral-900 uppercase font-mono text-[11px] mb-2 tracking-wider">Danh sách sản phẩm</h4>
                <div className="border border-neutral-200 rounded divide-y divide-neutral-100">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.name || item.productName} className="w-10 h-10 object-cover rounded border border-neutral-200" />
                        ) : (
                          <div className="w-10 h-10 bg-neutral-100 rounded border border-neutral-200" />
                        )}
                        <div>
                          <div className="font-medium text-neutral-900">{item.name || item.productName}</div>
                          {item.variantName && (
                            <div className="text-[11px] text-neutral-500">Phân loại: {item.variantName}</div>
                          )}
                          <div className="text-[11px] text-neutral-400 font-mono">
                            {item.price.toLocaleString('vi-VN')}₫ × {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-neutral-900">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-neutral-200 pt-4 space-y-2">
                <div className="flex justify-between text-neutral-500">
                  <span>Tiền hàng</span>
                  <span className="font-mono">{selectedOrder.subtotal?.toLocaleString('vi-VN') || selectedOrder.total.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Phí vận chuyển</span>
                  <span className="font-mono">{selectedOrder.shippingFee?.toLocaleString('vi-VN') || 0}₫</span>
                </div>
                {(selectedOrder.voucherDiscount || selectedOrder.discount) ? (
                  <div className="flex justify-between text-emerald-600">
                    <span>Giảm giá Voucher</span>
                    <span className="font-mono">-{(selectedOrder.voucherDiscount || selectedOrder.discount).toLocaleString('vi-VN')}₫</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-neutral-100">
                  <span>Tổng thanh toán</span>
                  <span className="font-mono text-[#FF5C00]">{selectedOrder.total.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-neutral-300 rounded text-neutral-700 font-medium hover:bg-neutral-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Order Reason Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900 mb-1">Từ chối đơn hàng {rejectModalOrder.code}</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Vui lòng nhập lý do từ chối để thông báo cho khách hàng và hủy đơn hàng.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ví dụ: Sản phẩm tạm thời hết hàng, chưa nhập thêm kịp..."
              className="w-full p-2.5 text-xs border border-neutral-300 rounded focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setRejectModalOrder(null)}
                className="px-3 py-1.5 text-xs border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-100"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={submittingAction}
                className="px-3 py-1.5 text-xs bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition-colors"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
