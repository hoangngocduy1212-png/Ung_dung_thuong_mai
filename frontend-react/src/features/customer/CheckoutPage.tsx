import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../../app/providers/CartProvider';
import { useAuth } from '../../hooks/useAuth';
import { customerService } from '../../services/customerService';
import type { Address, UserVoucher } from '../../types/customer';
import {
  User,
  Truck,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Wallet,
  Tag,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [receiver, setReceiver] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [detail, setDetail] = useState('');
  const [ward, setWard] = useState('Phường Bến Nghé');
  const [district, setDistrict] = useState('Quận 1');
  const [province, setProvince] = useState('TP. Hồ Chí Minh');
  const [note, setNote] = useState('');

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [availableVouchers, setAvailableVouchers] = useState<UserVoucher[]>([]);
  const [selectedVouchers, setSelectedVouchers] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load addresses and vouchers if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      customerService.getAddresses().then((addrs) => {
        if (Array.isArray(addrs) && addrs.length > 0) {
          setSavedAddresses(addrs);
          const def = addrs.find((a) => a.isDefault) || addrs[0];
          setSelectedAddressId(def._id || '');
          setReceiver(def.receiver);
          setPhone(def.phone);
          setDetail(def.detail);
          if (def.ward) setWard(def.ward);
          if (def.district) setDistrict(def.district);
          if (def.province) setProvince(def.province);
        }
      }).catch(() => {});

      customerService.getMyVouchers().then((uvs) => {
        if (Array.isArray(uvs)) {
          setAvailableVouchers(uvs.filter((uv) => uv.status === 'unused' && !(uv as any).expired));
        }
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const items = cart?.items || [];

  // Group items by shop for multi-vendor checkout
  const shopGroups = useMemo(() => {
    const map = new Map<string, { shopId: string; shopName: string; items: typeof items; subtotal: number }>();
    for (const it of items) {
      const p = it.product || ({} as any);
      const v = it.variant || ({} as any);
      const price = v.price || p.minPrice || 0;
      const shopId = p.shop?._id || (it as any).shop?._id || 'default_shop';
      const shopName = p.shop?.name || (it as any).shop?.name || 'Cửa hàng TECHSTORE';
      if (!map.has(shopId)) {
        map.set(shopId, { shopId, shopName, items: [], subtotal: 0 });
      }
      const g = map.get(shopId)!;
      g.items.push(it);
      g.subtotal += price * it.quantity;
    }
    return Array.from(map.values());
  }, [items]);

  const subtotal = shopGroups.reduce((sum, g) => sum + g.subtotal, 0);

  // Calculate voucher discount based on selectedVouchers (fixed amount in VND)
  const voucherDiscount = useMemo(() => {
    let disc = 0;
    for (const g of shopGroups) {
      const uvId = selectedVouchers[g.shopId];
      if (!uvId) continue;
      const uv = availableVouchers.find((v) => v._id === uvId);
      if (uv && uv.voucher) {
        if (g.subtotal >= (uv.voucher.minOrder || 0)) {
          disc += Math.min(uv.voucher.amount, g.subtotal);
        }
      }
    }
    return disc;
  }, [shopGroups, selectedVouchers, availableVouchers]);

  // Standard flat shipping fee 30,000 VND (aligned with backend config.shippingFee)
  const shippingFee = items.length > 0 ? 30000 : 0;
  const total = Math.max(0, subtotal - voucherDiscount + shippingFee);

  const handleAddressSelect = (addrId: string) => {
    setSelectedAddressId(addrId);
    const found = savedAddresses.find((a) => a._id === addrId);
    if (found) {
      setReceiver(found.receiver);
      setPhone(found.phone);
      setDetail(found.detail);
      if (found.ward) setWard(found.ward);
      if (found.district) setDistrict(found.district);
      if (found.province) setProvince(found.province);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiver || !phone || !detail) {
      setErrorMessage('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng.');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('Giỏ hàng của bạn đang trống.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const activeVouchers: Record<string, string> = {};
      for (const g of shopGroups) {
        const uvId = selectedVouchers[g.shopId];
        if (uvId) {
          const uv = availableVouchers.find((v) => v._id === uvId);
          if (uv && uv.voucher && g.subtotal >= (uv.voucher.minOrder || 0)) {
            activeVouchers[g.shopId] = uvId;
          }
        }
      }

      const payload = {
        addressId: selectedAddressId || undefined,
        address: {
          receiver,
          phone,
          detail,
          ward,
          district,
          province,
        },
        paymentMethod,
        note: note.trim() || undefined,
        vouchers: Object.keys(activeVouchers).length > 0 ? activeVouchers : undefined,
      };

      const result = await customerService.checkout(payload);
      await refreshCart();

      const firstOrder = result.orders?.[0];
      navigate(
        `/orders/confirmed?orderId=${firstOrder?._id || ''}&code=${firstOrder?.code || ''}&groupCode=${result.groupCode}`
      );
    } catch (err: any) {
      setErrorMessage(err?.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (val: number) => {
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 pb-24" data-purpose="checkout-page">
      {/* Header */}
      <div className="mb-8 pb-3 border-b border-neutral-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Thanh toán đơn hàng
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Vui lòng kiểm tra kỹ thông tin người nhận và phương thức thanh toán
        </p>
      </div>

      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2.5 overflow-hidden"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Form Left (8 cols) & Summary Right (4 cols) */}
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column Forms */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* 1. Recipient Info Card */}
          <section className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#FF5C00]" />
                <h2 className="text-base font-bold text-neutral-900">Thông tin người nhận</h2>
              </div>
              {savedAddresses.length > 0 && (
                <div className="text-xs text-neutral-500">
                  <span>Chọn từ sổ địa chỉ đã lưu</span>
                </div>
              )}
            </div>

            {/* Saved Address Radio Selection if available */}
            {savedAddresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr._id}
                    onClick={() => handleAddressSelect(addr._id!)}
                    className={`p-3.5 rounded-lg border text-xs cursor-pointer transition ${
                      selectedAddressId === addr._id
                        ? 'border-2 border-[#FF5C00] bg-orange-50/40'
                        : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-neutral-900">
                      <span>{addr.receiver}</span>
                      <span className="font-mono text-neutral-500">{addr.phone}</span>
                    </div>
                    <p className="text-neutral-600 mt-1 line-clamp-1">{addr.detail}</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {[addr.ward, addr.district, addr.province].filter(Boolean).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Address Details Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Họ tên người nhận <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#FF5C00]"
                  placeholder="Nhập họ tên"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#FF5C00] font-mono"
                  placeholder="0912 345 678"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Địa chỉ chi tiết (số nhà, tên đường) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#FF5C00]"
                  placeholder="Số 128 đường Lê Lợi..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Phường / Xã</label>
                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#FF5C00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Quận / Huyện, Tỉnh / Thành</label>
                <input
                  type="text"
                  value={`${district}, ${province}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(',');
                    setDistrict(parts[0]?.trim() || '');
                    setProvince(parts[1]?.trim() || '');
                  }}
                  className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#FF5C00]"
                />
              </div>
            </div>
          </section>

          {/* 2. Shipping Method Card */}
          <section className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
              <Truck className="w-5 h-5 text-[#FF5C00]" />
              <h2 className="text-base font-bold text-neutral-900">Phương thức giao hàng</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                onClick={() => setShippingMethod('standard')}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                  shippingMethod === 'standard'
                    ? 'border-2 border-[#FF5C00] bg-orange-50/30'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping_method"
                    checked={shippingMethod === 'standard'}
                    onChange={() => {}}
                    className="w-4 h-4 text-[#FF5C00] focus:ring-0"
                  />
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-neutral-900">Giao hàng tiêu chuẩn</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">Nhận hàng trong 1 - 3 ngày</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#FF5C00] font-mono">Miễn phí</span>
              </label>

              <label
                onClick={() => setShippingMethod('express')}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                  shippingMethod === 'express'
                    ? 'border-2 border-[#FF5C00] bg-orange-50/30'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping_method"
                    checked={shippingMethod === 'express'}
                    onChange={() => {}}
                    className="w-4 h-4 text-[#FF5C00] focus:ring-0"
                  />
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-neutral-900">Giao hàng hỏa tốc 2H</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">Nhận hàng ngay trong ngày</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-neutral-700 font-mono">+30.000 ₫</span>
              </label>
            </div>
          </section>

          {/* 3. Payment Method Card */}
          <section className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
              <CreditCard className="w-5 h-5 text-[#FF5C00]" />
              <h2 className="text-base font-bold text-neutral-900">Phương thức thanh toán</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                onClick={() => setPaymentMethod('cod')}
                className={`flex items-center p-4 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'cod'
                    ? 'border-2 border-[#FF5C00] bg-orange-50/30'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'cod'}
                    onChange={() => {}}
                    className="w-4 h-4 text-[#FF5C00] focus:ring-0"
                  />
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-neutral-900">Thanh toán khi nhận hàng (COD)</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">Thanh toán tiền mặt cho shipper</div>
                  </div>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('online')}
                className={`flex items-center p-4 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'online'
                    ? 'border-2 border-[#FF5C00] bg-orange-50/30'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'online'}
                    onChange={() => {}}
                    className="w-4 h-4 text-[#FF5C00] focus:ring-0"
                  />
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF5C00]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-neutral-900">Chuyển khoản / VNPAY QR</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">Xác nhận đơn ngay sau thanh toán</div>
                  </div>
                </div>
              </label>
            </div>
          </section>

          {/* Note Input */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Ghi chú đơn hàng (không bắt buộc)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú thêm về thời gian giao hàng, địa điểm chi tiết..."
              className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-lg outline-none focus:ring-1 focus:ring-[#FF5C00]"
            />
          </div>
        </div>

        {/* Right Column: Order Summary Panel */}
        <div className="lg:col-span-4 sticky top-28 space-y-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="text-base font-bold text-neutral-900">Tóm tắt đơn hàng</h2>
              <Link to="/cart" className="text-xs font-semibold text-[#FF5C00] hover:underline">
                Chỉnh sửa
              </Link>
            </div>

            {/* Product items mini list */}
            <div className="divide-y divide-neutral-100 max-h-72 overflow-y-auto pr-1">
              {items.map((it) => {
                const p = it.product || ({} as any);
                const v = it.variant || ({} as any);
                const price = v.price || p.minPrice || 0;
                return (
                  <div key={it._id} className="py-3 flex gap-3 items-center text-xs">
                    <div className="w-12 h-12 rounded border border-neutral-200 bg-neutral-50 p-1 flex items-center justify-center flex-shrink-0">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80'}
                        alt={p.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-neutral-900 truncate">{p.name || 'Sản phẩm'}</h4>
                      {v.name && <p className="text-[11px] text-neutral-500 font-mono">{v.name}</p>}
                    </div>
                    <div className="text-right flex-shrink-0 font-mono">
                      <span className="font-bold text-neutral-900">{formatPrice(price)}</span>
                      <span className="block text-[11px] text-neutral-400">x{it.quantity}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Voucher Selection Section */}
            <div className="border-t border-neutral-200 pt-3 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
                <Tag className="w-3.5 h-3.5 text-[#FF5C00]" />
                <span>Mã giảm giá (Voucher)</span>
              </div>

              {availableVouchers.length === 0 ? (
                <div className="p-2.5 bg-neutral-50 rounded-lg text-[11px] text-neutral-500">
                  <span>Chưa có voucher trong ví. </span>
                  <Link to="/promotions" className="text-[#FF5C00] font-semibold hover:underline">
                    Xem ưu đãi
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {shopGroups.map((g) => {
                    const shopVouchers = availableVouchers.filter((uv) => {
                      const v = uv.voucher;
                      if (!v) return false;
                      if (v.scope === 'shop' && v.shop && v.shop !== g.shopId) return false;
                      return true;
                    });

                    return (
                      <div key={g.shopId} className="space-y-1">
                        <label className="block text-[11px] text-neutral-500 truncate">
                          Voucher cho: <span className="font-semibold text-neutral-700">{g.shopName}</span>
                        </label>
                        <select
                          value={selectedVouchers[g.shopId] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedVouchers((prev) => {
                              const next = { ...prev };
                              if (val) next[g.shopId] = val;
                              else delete next[g.shopId];
                              return next;
                            });
                          }}
                          className="w-full text-xs py-1.5 px-2 bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:border-[#FF5C00]"
                        >
                          <option value="">-- Không áp dụng voucher --</option>
                          {shopVouchers.map((uv) => {
                            const v = uv.voucher;
                            const eligible = g.subtotal >= (v.minOrder || 0);
                            return (
                              <option key={uv._id} value={uv._id} disabled={!eligible}>
                                {v.code} - Giảm {formatPrice(v.amount)} {eligible ? '' : `(Đơn từ ${formatPrice(v.minOrder)})`}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-neutral-200 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Tạm tính</span>
                <span className="font-semibold text-neutral-900 font-mono">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Phí giao hàng</span>
                <span className="font-semibold text-neutral-900 font-mono">{formatPrice(shippingFee)}</span>
              </div>
              {voucherDiscount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Giảm giá Voucher</span>
                  <span className="font-semibold font-mono">-{formatPrice(voucherDiscount)}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="border-t border-neutral-200 pt-3">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-sm font-bold text-neutral-900">Tổng thanh toán</span>
                <span className="text-2xl font-black text-[#FF5C00] font-mono">
                  {formatPrice(total)}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 text-right">Đã bao gồm VAT nếu có</p>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.15 }}
              className="w-full py-3.5 bg-[#FF5C00] hover:bg-[#E55200] disabled:bg-neutral-300 text-white font-bold rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-xs cursor-pointer text-sm select-none"
            >
              <span>{isSubmitting ? 'Đang tạo đơn hàng...' : 'Xác nhận đặt hàng'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
};
