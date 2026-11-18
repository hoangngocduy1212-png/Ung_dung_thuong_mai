import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../app/providers/CartProvider';
import { useAuth } from '../../hooks/useAuth';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeItem, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState<string | null>(null);

  const items = cart?.items || [];

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;
    const code = voucherCode.trim().toUpperCase();
    if (code === 'TECH50K') {
      setVoucherDiscount(50000);
      setVoucherMessage('Áp dụng thành công mã giảm 50.000 ₫!');
    } else if (code === 'MONOLITH100') {
      setVoucherDiscount(100000);
      setVoucherMessage('Áp dụng thành công mã giảm 100.000 ₫!');
    } else {
      setVoucherDiscount(0);
      setVoucherMessage('Mã giảm giá không tồn tại hoặc đã hết hạn.');
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const price = item.variant?.price || item.product?.minPrice || 0;
      return sum + price * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shippingFee = 0; // Free shipping
  const total = Math.max(0, subtotal - voucherDiscount + shippingFee);

  const formatPrice = (val: number) => {
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  if (items.length === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-16">
        <EmptyState
          title="Giỏ hàng của bạn đang trống"
          description="Hiện tại bạn chưa chọn bất kỳ sản phẩm nào. Hãy khám phá kho thiết bị công nghệ chính hãng tại TECHSTORE."
          actionText="Tiếp tục mua sắm"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-6 md:py-8 pb-24" data-purpose="cart-page-content">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-6 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900">
            Giỏ hàng của bạn
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-mono mt-1">
            {itemCount} sản phẩm trong giỏ hàng
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center text-xs sm:text-sm font-semibold text-[#FF5C00] hover:underline transition mt-2 sm:mt-0 gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tiếp tục mua sắm</span>
        </Link>
      </div>

      {/* Main Grid: Items Table (8 cols) & Summary (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Table of items */}
        <section className="lg:col-span-8 bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
          {/* Header Row */}
          <div className="grid grid-cols-12 px-6 py-3.5 border-b border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-500 uppercase tracking-wider font-mono">
            <div className="col-span-6">Sản phẩm</div>
            <div className="col-span-2 text-center">Đơn giá</div>
            <div className="col-span-2 text-center">Số lượng</div>
            <div className="col-span-2 text-right pr-2">Thành tiền</div>
          </div>

          {/* Item Rows */}
          <div className="divide-y divide-neutral-100">
            {items.map((item) => {
              const p = item.product || ({} as any);
              const v = item.variant || ({} as any);
              const price = v.price || p.minPrice || 0;
              const lineTotal = price * item.quantity;
              const img = p.images?.[0] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80';

              return (
                <div key={item._id} className="grid grid-cols-12 items-center px-6 py-5 hover:bg-neutral-50/50 transition">
                  {/* Product Details & Image */}
                  <div className="col-span-6 flex items-center gap-4">
                    <div className="w-16 h-16 shrink-0 bg-neutral-50 border border-neutral-200 rounded-lg p-1 flex items-center justify-center overflow-hidden">
                      <img src={img} alt={p.name || 'Sản phẩm'} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="min-w-0 pr-2">
                      <Link to={`/products/${p._id}`} className="text-xs sm:text-sm font-bold text-neutral-900 hover:text-[#FF5C00] transition line-clamp-2 leading-snug">
                        {p.name || 'Sản phẩm TECHSTORE'}
                      </Link>
                      {v.name && (
                        <p className="text-[11px] text-neutral-500 mt-1 font-mono">
                          Phân loại: {v.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Unit Price */}
                  <div className="col-span-2 text-center text-xs font-semibold text-neutral-700 font-mono">
                    {formatPrice(price)}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="col-span-2 flex justify-center">
                    <div className="inline-flex items-center border border-neutral-300 rounded-md bg-white overflow-hidden shadow-xs">
                      <button
                        onClick={() => updateQuantity(item._id!, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
                        title="Giảm số lượng"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-neutral-900 font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id!, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
                        title="Tăng số lượng"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Line Total & Remove */}
                  <div className="col-span-2 flex items-center justify-end gap-3 text-right">
                    <span className="text-xs sm:text-sm font-bold text-[#FF5C00] font-mono">
                      {formatPrice(lineTotal)}
                    </span>
                    <button
                      onClick={() => removeItem(item._id!)}
                      className="text-neutral-400 hover:text-red-500 transition p-1 cursor-pointer"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Order Summary Sidebar (4 cols) */}
        <section className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-neutral-900 pb-2 border-b border-neutral-100">
              Tóm tắt đơn hàng
            </h2>

            {/* Calculations */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center text-neutral-600">
                <span>Tạm tính ({itemCount} sản phẩm)</span>
                <span className="font-semibold text-neutral-900 font-mono">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-neutral-600">
                <span>Phí giao hàng</span>
                <span className="font-semibold text-emerald-600 font-mono">0 ₫ (Miễn phí)</span>
              </div>

              {voucherDiscount > 0 && (
                <div className="flex justify-between items-center text-red-600">
                  <span>Giảm giá Voucher</span>
                  <span className="font-semibold font-mono">-{formatPrice(voucherDiscount)}</span>
                </div>
              )}
            </div>

            {/* Voucher Input */}
            <form onSubmit={handleApplyVoucher} className="pt-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Mã giảm giá / Voucher
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="Nhập mã (TECH50K, MONOLITH100)"
                  className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#FF5C00] font-mono uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Áp dụng
                </button>
              </div>
              {voucherMessage && (
                <p className={`text-[11px] mt-1.5 ${voucherDiscount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {voucherMessage}
                </p>
              )}
            </form>

            {/* Total Row */}
            <div className="border-t border-neutral-200 pt-4 mt-2">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-sm font-bold text-neutral-900">Tổng cộng</span>
                <span className="text-2xl font-extrabold text-[#FF5C00] font-mono">
                  {formatPrice(total)}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 text-right">Đã bao gồm VAT & Miễn phí vận chuyển</p>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login?redirect=/checkout');
                } else {
                  navigate('/checkout');
                }
              }}
              className="w-full py-3.5 bg-[#FF5C00] hover:bg-[#E55200] active:scale-[0.99] text-white font-bold rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-xs cursor-pointer text-sm"
            >
              <span>Tiến hành thanh toán</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust badge */}
            <div className="pt-2 flex items-center justify-center gap-2 text-neutral-400 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Giao dịch an toàn chuẩn 256-bit SSL</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
