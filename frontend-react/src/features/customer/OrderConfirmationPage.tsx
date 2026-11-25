import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import type { Order } from '../../types/order';
import {
  CheckCircle2,
  Truck,
  CreditCard,
} from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const codeParam = searchParams.get('code');
  const groupCode = searchParams.get('groupCode');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const handlePayNow = async () => {
    const targetGroup = order?.groupCode || groupCode;
    if (!targetGroup) return;
    try {
      setIsPaying(true);
      const res = await customerService.createVNPayUrl(targetGroup);
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } catch (err: any) {
      alert(err?.message || 'Không thể kết nối cổng VNPay. Vui lòng thử lại sau.');
    } finally {
      setIsPaying(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      setLoading(true);
      customerService
        .getOrderById(orderId)
        .then((data) => setOrder(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  const displayCode = order?.code || codeParam || groupCode || 'DH-' + Date.now();
  const formatPrice = (val?: number) => {
    if (typeof val !== 'number') return '0 ₫';
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  if (loading) {
    return (
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-16 text-center text-xs font-mono text-neutral-400">
        Đang tải thông tin xác nhận đơn hàng...
      </div>
    );
  }

  return (
    <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 pb-24" data-purpose="confirmation-page">
      {/* Top Confirmation Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-neutral-200 gap-6">
        <div className="flex items-start md:items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 text-white shadow-sm">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight leading-tight">
              Đặt hàng thành công
            </h1>
            <p className="text-sm text-neutral-600 font-medium mt-1">
              Cảm ơn bạn đã mua sắm tại hệ sinh thái công nghệ TECHSTORE.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-neutral-500 font-medium">Mã đơn hàng:</span>
              <span className="inline-block px-3 py-1 bg-neutral-100 border border-neutral-300 rounded text-xs font-mono font-bold text-neutral-800 select-all">
                {displayCode}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-center pt-2 md:pt-0">
          <Link
            to={orderId ? `/orders/${orderId}/tracking` : '/account/orders'}
            className="px-6 py-3 bg-[#FF5C00] hover:bg-[#E55200] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors text-center"
          >
            Theo dõi đơn hàng
          </Link>
          <Link
            to="/products"
            className="px-6 py-3 bg-white border border-[#FF5C00] text-[#FF5C00] hover:bg-orange-50 text-xs sm:text-sm font-semibold rounded-xl transition-colors text-center"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>

      {/* Main Grid: Products Table (Left) & Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-8">
        {/* Left Column: Ordered Products Table */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-base font-bold text-neutral-900">Chi tiết sản phẩm đã đặt</h2>

          <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="grid grid-cols-12 py-3 px-4 text-xs font-semibold text-neutral-500 bg-neutral-50 border-b border-neutral-200 font-mono">
              <div className="col-span-6">Sản phẩm</div>
              <div className="col-span-2 text-center">Đơn giá</div>
              <div className="col-span-2 text-center">Số lượng</div>
              <div className="col-span-2 text-right">Thành tiền</div>
            </div>

            <div className="divide-y divide-neutral-100">
              {order?.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 items-center px-4 py-4 text-xs">
                    <div className="col-span-6 flex items-center gap-3">
                      <div className="w-12 h-12 rounded border border-neutral-200 bg-neutral-50 p-1 flex items-center justify-center flex-shrink-0">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80'}
                          alt={item.productName}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 leading-snug">{item.productName}</h4>
                        {item.variantName && (
                          <p className="text-[11px] text-neutral-500 font-mono mt-0.5">{item.variantName}</p>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2 text-center font-mono text-neutral-700">
                      {formatPrice(item.price)}
                    </div>

                    <div className="col-span-2 text-center font-mono text-neutral-700">
                      x{item.quantity}
                    </div>

                    <div className="col-span-2 text-right font-mono font-bold text-[#FF5C00]">
                      {formatPrice((item.price || 0) * (item.quantity || 1))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-neutral-500">
                  Thông tin sản phẩm đang được hệ thống đồng bộ hóa.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Delivery and Financial Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          {/* Shipping Info Card */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
              <Truck className="w-4 h-4 text-[#FF5C00]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Thông tin giao hàng
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Người nhận:</span>
                <span className="font-semibold text-neutral-900">{order?.shippingAddress?.receiver || 'Quý khách'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Điện thoại:</span>
                <span className="font-mono text-neutral-900">{order?.shippingAddress?.phone || 'Đã xác nhận'}</span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-0.5">Địa chỉ:</span>
                <span className="text-neutral-800 leading-relaxed block">
                  {order?.shippingAddress
                    ? `${order.shippingAddress.detail}, ${order.shippingAddress.ward || ''}, ${order.shippingAddress.district || ''}, ${order.shippingAddress.province || ''}`
                    : 'Giao theo thông tin đơn hàng đã cung cấp'}
                </span>
              </div>
            </div>
          </div>

          {/* Payment & Total Breakdown */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
              <CreditCard className="w-4 h-4 text-[#FF5C00]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Thanh toán
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Hình thức:</span>
                <span className="font-semibold text-neutral-900 uppercase">
                  {order?.payment?.method === 'online' ? 'Chuyển khoản / VNPAY' : 'Tiền mặt khi nhận (COD)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Trạng thái:</span>
                <span className={`font-semibold ${order?.payment?.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {order?.payment?.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </div>
              <div className="border-t border-neutral-100 pt-2 flex justify-between items-baseline">
                <span className="text-sm font-bold text-neutral-900">Tổng thanh toán:</span>
                <span className="text-xl font-black text-[#FF5C00] font-mono">
                  {formatPrice(order?.total)}
                </span>
              </div>

              {order?.payment?.method === 'online' && order?.payment?.status === 'unpaid' && (
                <button
                  type="button"
                  onClick={handlePayNow}
                  disabled={isPaying}
                  className="mt-3 w-full py-2.5 bg-[#FF5C00] hover:bg-[#E55200] disabled:bg-neutral-300 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-[0.98]"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isPaying ? 'Đang kết nối VNPay...' : 'Thanh toán VNPay ngay'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
