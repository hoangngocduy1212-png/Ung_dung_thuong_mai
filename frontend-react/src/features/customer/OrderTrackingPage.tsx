import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import type { Order, OrderStatus } from '../../types/order';
import {
  ClipboardList,
  Cog,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

const STATUS_STEPS: Array<{ key: OrderStatus; label: string; desc: string }> = [
  { key: 'cho_xac_nhan', label: 'Đã đặt hàng', desc: 'Đơn hàng của bạn đã được ghi nhận' },
  { key: 'da_xac_nhan', label: 'Đang xử lý', desc: 'Gian hàng đang chuẩn bị đóng gói' },
  { key: 'dang_giao', label: 'Đang giao hàng', desc: 'Đơn hàng đang được vận chuyển' },
  { key: 'da_giao', label: 'Đã giao hàng', desc: 'Đơn hàng đã được giao thành công' },
];

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [orderCodeInput, setOrderCodeInput] = useState(id || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchOrder = async (orderIdOrCode: string) => {
    if (!orderIdOrCode.trim()) return;
    setLoading(true);
    setError(null);
    setActionSuccess(null);
    try {
      const data = await customerService.getOrderById(orderIdOrCode.trim());
      setOrder(data);
    } catch (err: any) {
      setError(err?.message || 'Không tìm thấy đơn hàng với mã đã nhập.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder(id);
    }
  }, [id]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderCodeInput);
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    const confirmed = window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?');
    if (!confirmed) return;

    try {
      await customerService.cancelOrder(order._id, 'Khách hàng yêu cầu hủy đơn');
      setActionSuccess('Đã hủy đơn hàng thành công.');
      await fetchOrder(order._id);
    } catch (err: any) {
      setError(err?.message || 'Không thể hủy đơn hàng.');
    }
  };

  const handleConfirmReceived = async () => {
    if (!order) return;
    try {
      await customerService.confirmReceived(order._id);
      setActionSuccess('Đã xác nhận nhận hàng thành công.');
      await fetchOrder(order._id);
    } catch (err: any) {
      setError(err?.message || 'Không thể xác nhận nhận hàng.');
    }
  };

  const getStepIndex = (status?: OrderStatus) => {
    if (!status) return 0;
    if (status === 'cho_xac_nhan') return 0;
    if (status === 'da_xac_nhan') return 1;
    if (status === 'dang_giao') return 2;
    if (status === 'da_giao' || status === 'hoan_tat') return 3;
    return -1; // cancelled or returned
  };

  const currentStep = getStepIndex(order?.status);

  const formatPrice = (val?: number) => {
    if (typeof val !== 'number') return '0 ₫';
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 pb-24 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Theo dõi đơn hàng
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Nhập mã đơn hàng để xem tiến độ và lịch trình vận chuyển chi tiết
        </p>
      </div>

      {/* Lookup Bar */}
      <section className="bg-neutral-100 rounded-xl p-4 sm:p-5 border border-neutral-200">
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row items-center gap-4">
          <label className="text-xs sm:text-sm font-bold text-neutral-900 whitespace-nowrap min-w-[90px]">
            Mã đơn hàng
          </label>
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={orderCodeInput}
              onChange={(e) => setOrderCodeInput(e.target.value)}
              placeholder="Nhập mã đơn hàng (#DH... hoặc ID)"
              className="w-full bg-white text-neutral-900 text-xs sm:text-sm rounded-lg border border-neutral-300 px-4 py-2.5 outline-none focus:ring-1 focus:ring-[#FF5C00] font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-2.5 bg-[#FF5C00] hover:bg-[#E55200] disabled:bg-neutral-300 text-white text-xs sm:text-sm font-semibold rounded-lg transition shadow-xs whitespace-nowrap cursor-pointer"
          >
            {loading ? 'Đang tra cứu...' : 'Tra cứu'}
          </button>
        </form>
      </section>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {order && (
        <>
          {/* Stepper Timeline Section */}
          <section className="bg-white rounded-xl border border-neutral-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-neutral-100 gap-3">
              <div>
                <span className="text-xs text-neutral-500">Mã đơn hàng:</span>
                <span className="font-mono font-bold text-sm text-neutral-900 ml-2">
                  {order.code}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Trạng thái:</span>
                <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-[#FF5C00] border border-orange-200 uppercase">
                  {order.status}
                </span>
              </div>
            </div>

            {order.status === 'da_huy' ? (
              <div className="p-6 rounded-xl bg-red-50 border border-red-200 text-center space-y-2">
                <XCircle className="w-10 h-10 text-red-500 mx-auto" />
                <h3 className="text-base font-bold text-red-900">Đơn hàng đã bị hủy</h3>
                <p className="text-xs text-red-700">
                  Lý do: {order.cancelReason || 'Người mua hoặc người bán đã hủy đơn hàng này.'}
                </p>
              </div>
            ) : (
              <div className="relative px-2 sm:px-6">
                {/* Horizontal Connector Line */}
                <div className="absolute top-6 left-12 right-12 h-[3px] bg-neutral-200 -z-0 hidden md:block">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(Math.max(0, currentStep) / 3) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-2 relative z-10">
                  {STATUS_STEPS.map((step, idx) => {
                    const isDone = currentStep >= idx;
                    const isCurrent = currentStep === idx;
                    return (
                      <div key={step.key} className="flex flex-col items-center text-center">
                        <div
                          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-xs transition-colors ${
                            isDone
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'bg-white border-neutral-300 text-neutral-400'
                          }`}
                        >
                          {idx === 0 && <ClipboardList className="w-6 h-6" />}
                          {idx === 1 && <Cog className={`w-6 h-6 ${isCurrent ? 'animate-spin' : ''}`} />}
                          {idx === 2 && <Truck className="w-6 h-6" />}
                          {idx === 3 && <CheckCircle2 className="w-6 h-6" />}
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-neutral-900 mt-3 mb-0.5">
                          {step.label}
                        </h3>
                        <p className="text-[11px] text-neutral-500 max-w-[140px] leading-tight">
                          {step.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Actions Bar */}
            <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-wrap items-center justify-end gap-3">
              {order.status === 'cho_xac_nhan' && (
                <button
                  onClick={handleCancelOrder}
                  className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold transition cursor-pointer"
                >
                  Hủy đơn hàng
                </button>
              )}

              {order.status === 'da_giao' && (
                <button
                  onClick={handleConfirmReceived}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Đã nhận được hàng
                </button>
              )}
            </div>
          </section>

          {/* Details Grid: Shipping Info (Left) & Summary (Right) */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column Left: Shipping Info */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs flex flex-col">
              <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                <h2 className="text-sm font-bold text-neutral-900">Thông tin giao hàng</h2>
              </div>
              <div className="p-6 text-xs sm:text-sm space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Người nhận:</span>
                  <span className="font-semibold text-neutral-900">{order.shippingAddress?.receiver}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Số điện thoại:</span>
                  <span className="font-mono font-medium text-neutral-900">{order.shippingAddress?.phone}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block mb-0.5">Địa chỉ giao hàng:</span>
                  <span className="text-neutral-800 leading-relaxed block">
                    {order.shippingAddress?.detail}, {order.shippingAddress?.ward}, {order.shippingAddress?.district}, {order.shippingAddress?.province}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-100">
                  <span className="text-neutral-500">Đơn vị vận chuyển:</span>
                  <span className="font-semibold text-neutral-900">Giao Hàng Nhanh (GHN Express)</span>
                </div>
              </div>
            </div>

            {/* Column Right: Ordered Products Summary */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs flex flex-col">
              <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                <h2 className="text-sm font-bold text-neutral-900">Sản phẩm trong đơn</h2>
              </div>
              <div className="p-4 divide-y divide-neutral-100 max-h-80 overflow-y-auto">
                {order.items?.map((it, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded border border-neutral-200 bg-neutral-50 p-1 flex-shrink-0 flex items-center justify-center">
                        <img
                          src={it.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80'}
                          alt={it.productName}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="truncate">
                        <h4 className="font-bold text-neutral-900 truncate">{it.productName}</h4>
                        {it.variantName && <p className="text-[11px] text-neutral-500 font-mono">{it.variantName}</p>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 font-mono">
                      <span className="font-bold text-[#FF5C00]">{formatPrice(it.price)}</span>
                      <span className="block text-[11px] text-neutral-400">x{it.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-between items-baseline text-xs">
                <span className="font-bold text-neutral-900">Tổng thanh toán:</span>
                <span className="text-base font-extrabold text-[#FF5C00] font-mono">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
