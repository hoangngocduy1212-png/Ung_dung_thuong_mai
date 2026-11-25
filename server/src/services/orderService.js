import config from '../config.js';
import AppError from '../utils/AppError.js';
import { genCode } from '../utils/helpers.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Shop from '../models/Shop.js';
import { Cart } from '../models/Cart.js';
import { Product, Variant } from '../models/Product.js';
import { UserVoucher, Voucher, PointTx } from '../models/Voucher.js';
import { AfterSales } from '../models/Support.js';

const push = (order, status, by, note) => {
  order.status = status;
  order.statusHistory.push({ status, by, note, at: new Date() });
};

// ---------- Hoàn tác khi đặt hàng lỗi giữa chừng ----------
async function restoreStock(lines) {
  for (const l of lines) await Variant.updateOne({ _id: l.variant._id ?? l.variant, }, { $inc: { stock: l.quantity } });
}
async function restoreVoucher(userVoucherId) {
  const uv = await UserVoucher.findById(userVoucherId);
  if (!uv || uv.status !== 'used') return;
  const v = await Voucher.findById(uv.voucher);
  // Voucher còn hạn thì trả lại cho khách; hết hạn thì thôi
  if (v && !v.isDeleted && v.endDate > new Date()) {
    await UserVoucher.updateOne({ _id: uv._id }, { status: 'unused', $unset: { usedAt: 1, order: 1 } });
  }
}

// ---------- Đặt hàng: giỏ hàng -> nhiều đơn (mỗi gian hàng 1 đơn) ----------
export async function checkout(user, input) {
  const cart = await Cart.findOne({ user: user._id });
  if (!cart || !cart.items.length) throw new AppError('Giỏ hàng đang trống', 400);

  let selected = cart.items;
  if (input.cartItemIds?.length) {
    const ids = new Set(input.cartItemIds);
    selected = cart.items.filter((i) => ids.has(String(i._id)));
  }
  if (!selected.length) throw new AppError('Chưa chọn sản phẩm nào để đặt', 400);

  // 1. Kiểm tra sản phẩm còn bán, còn hàng
  const variants = await Variant.find({ _id: { $in: selected.map((i) => i.variant) }, isDeleted: false });
  const products = await Product.find({ _id: { $in: selected.map((i) => i.product) }, isDeleted: false, hidden: false });
  const shops = await Shop.find({ _id: { $in: products.map((p) => p.shop) }, status: 'active' });
  const vMap = new Map(variants.map((v) => [String(v._id), v]));
  const pMap = new Map(products.map((p) => [String(p._id), p]));
  const sMap = new Map(shops.map((s) => [String(s._id), s]));

  const groups = new Map(); // shopId -> { shop, lines }
  for (const it of selected) {
    const v = vMap.get(String(it.variant));
    const p = pMap.get(String(it.product));
    const s = p && sMap.get(String(p.shop));
    if (!v || !p || !s || String(v.product) !== String(p._id)) throw new AppError('Có sản phẩm trong giỏ đã ngừng bán, vui lòng xóa khỏi giỏ', 400);
    if (it.quantity > v.stock) throw new AppError(`"${p.name} (${v.name})" chỉ còn ${v.stock} sản phẩm`, 409);
    const key = String(s._id);
    if (!groups.has(key)) groups.set(key, { shop: s, lines: [] });
    groups.get(key).lines.push({ product: p, variant: v, quantity: it.quantity });
  }
  for (const key of Object.keys(input.vouchers || {})) {
    if (!groups.has(key)) throw new AppError('Voucher được gán cho gian hàng không có trong đơn', 400);
  }

  // 2. Kiểm tra voucher (mỗi đơn - tức mỗi gian hàng - tối đa 1 voucher)
  const now = new Date();
  const usedIds = new Set();
  for (const [shopId, g] of groups) {
    g.subtotal = g.lines.reduce((s, l) => s + l.variant.price * l.quantity, 0);
    g.discount = 0;
    const uvId = input.vouchers?.[shopId];
    if (!uvId) continue;
    if (usedIds.has(uvId)) throw new AppError('Mỗi voucher chỉ dùng cho một đơn', 400);
    usedIds.add(uvId);
    const uv = await UserVoucher.findOne({ _id: uvId, user: user._id, status: 'unused' }).populate('voucher');
    const v = uv?.voucher;
    if (!uv || !v || v.isDeleted || !v.active || v.startDate > now || v.endDate <= now) throw new AppError('Voucher không hợp lệ hoặc đã hết hạn', 400);
    if (v.scope === 'shop' && String(v.shop) !== shopId) throw new AppError(`Voucher ${v.code} không áp dụng cho gian hàng này`, 400);
    if (g.subtotal < v.minOrder) throw new AppError(`Voucher ${v.code} chỉ áp dụng cho đơn từ ${v.minOrder.toLocaleString('vi-VN')}đ`, 400);
    g.uv = uv;
    g.voucher = v;
    g.discount = Math.min(v.amount, g.subtotal);
  }

  // 3. Giữ hàng (trừ kho nguyên tử) -> dùng voucher -> tạo đơn. Lỗi ở bước nào thì hoàn tác các bước trước.
  const reserved = [];
  const usedVouchers = [];
  const created = [];
  try {
    for (const g of groups.values()) {
      for (const l of g.lines) {
        const r = await Variant.updateOne({ _id: l.variant._id, isDeleted: false, stock: { $gte: l.quantity } }, { $inc: { stock: -l.quantity } });
        if (!r.modifiedCount) throw new AppError(`"${l.product.name} (${l.variant.name})" vừa hết hàng`, 409);
        reserved.push(l);
      }
    }
    for (const g of groups.values()) {
      if (!g.uv) continue;
      const r = await UserVoucher.updateOne({ _id: g.uv._id, user: user._id, status: 'unused' }, { status: 'used', usedAt: now });
      if (!r.modifiedCount) throw new AppError('Voucher đã được sử dụng', 409);
      usedVouchers.push(g.uv._id);
    }
    const groupCode = genCode('TT');
    const groupValues = Array.from(groups.values());
    const isExpress = input.shippingMethod === 'express';
    for (let idx = 0; idx < groupValues.length; idx++) {
      const g = groupValues[idx];
      const expressSurcharge = (isExpress && idx === 0) ? 30000 : 0;
      const shippingFee = config.shippingFee + expressSurcharge;
      const order = await Order.create({
        code: genCode('DH'),
        groupCode,
        customer: user._id,
        shop: g.shop._id,
        items: g.lines.map((l) => ({
          product: l.product._id,
          variant: l.variant._id,
          productName: l.product.name,
          variantName: l.variant.name,
          image: l.product.images?.[0],
          price: l.variant.price,
          quantity: l.quantity,
        })),
        shippingAddress: input.address,
        shippingMethod: input.shippingMethod || 'standard',
        note: input.note,
        subtotal: g.subtotal,
        shippingFee,
        userVoucher: g.uv?._id,
        voucherCode: g.voucher?.code,
        discountBy: g.voucher?.scope,
        discount: g.discount,
        total: g.subtotal - g.discount + shippingFee,
        // Voucher toàn sàn do sàn chịu: gian hàng vẫn nhận đủ tiền hàng. Voucher của shop thì shop chịu.
        sellerRevenue: g.subtotal - (g.voucher?.scope === 'shop' ? g.discount : 0),
        payment: { method: input.paymentMethod, status: 'unpaid' },
        status: 'cho_xac_nhan',
        statusHistory: [{ status: 'cho_xac_nhan', by: user._id, at: now }],
      });
      created.push(order);
      if (g.uv) await UserVoucher.updateOne({ _id: g.uv._id }, { order: order._id });
    }
  } catch (e) {
    await Order.deleteMany({ _id: { $in: created.map((o) => o._id) } });
    for (const id of usedVouchers) await restoreVoucher(id);
    await restoreStock(reserved);
    throw e;
  }

  // 4. Xóa các món đã đặt khỏi giỏ
  const bought = new Set(selected.map((i) => String(i._id)));
  cart.items = cart.items.filter((i) => !bought.has(String(i._id)));
  await cart.save();
  return created;
}

// ---------- Thanh toán online (giả lập) cho cả nhóm đơn ----------
export async function payGroup(user, groupCode) {
  const orders = await Order.find({ groupCode, customer: user._id, 'payment.method': 'online', 'payment.status': 'unpaid', status: { $nin: ['da_huy', 'da_tra_hang'] } });
  if (!orders.length) throw new AppError('Không có đơn nào cần thanh toán online', 404);
  const txnId = 'SIM' + Date.now().toString(36).toUpperCase();
  for (const o of orders) {
    o.payment.status = 'paid';
    o.payment.paidAt = new Date();
    o.payment.txnId = txnId;
    await o.save();
  }
  return orders;
}

// ---------- Hủy đơn (khách hủy khi chờ xác nhận / seller từ chối / seller đồng ý yêu cầu hủy) ----------
export async function cancelOrder(order, by, reason) {
  for (const it of order.items) await Variant.updateOne({ _id: it.variant }, { $inc: { stock: it.quantity } });
  if (order.userVoucher) await restoreVoucher(order.userVoucher);
  if (order.payment.status === 'paid') order.payment.status = 'refunded';
  order.cancelReason = reason;
  push(order, 'da_huy', by, reason);
  await order.save();
  return order;
}

// ---------- Đã giao ----------
export async function markDelivered(order, by) {
  push(order, 'da_giao', by);
  order.deliveredAt = new Date();
  if (order.payment.method === 'cod' && order.payment.status === 'unpaid') {
    order.payment.status = 'paid'; // COD: thu tiền khi giao
    order.payment.paidAt = new Date();
  }
  await order.save();
  return order;
}

// ---------- Hoàn tất (khách xác nhận đã nhận hoặc tự động) -> cộng điểm ----------
export async function completeOrder(order, by) {
  push(order, 'hoan_tat', by, by ? undefined : 'Tự động hoàn tất');
  order.completedAt = new Date();
  const points = Math.floor((order.subtotal - order.discount) / config.pointUnit);
  if (points > 0) {
    order.pointsEarned = points;
    await User.updateOne({ _id: order.customer }, { $inc: { points } });
    await PointTx.create({ user: order.customer, delta: points, type: 'earn', order: order._id, note: `Mua đơn ${order.code}` });
  }
  for (const it of order.items) await Product.updateOne({ _id: it.product }, { $inc: { soldCount: it.quantity } });
  await order.save();
  return order;
}

// ---------- Trả hàng / hoàn tiền xong: hoàn tiền + thu hồi điểm ----------
// Lưu ý: không tự cộng lại tồn kho vì hàng trả về có thể lỗi - seller tự điều chỉnh tồn kho.
export async function refundOrder(order, by, note) {
  if (order.payment.status === 'paid') order.payment.status = 'refunded';
  if (order.pointsEarned > 0) {
    const u = await User.findById(order.customer).select('points');
    const revoke = Math.min(u?.points || 0, order.pointsEarned);
    if (revoke > 0) {
      await User.updateOne({ _id: order.customer }, { $inc: { points: -revoke } });
      await PointTx.create({ user: order.customer, delta: -revoke, type: 'revoke', order: order._id, note: `Hoàn tiền đơn ${order.code}` });
    }
  }
  push(order, 'da_tra_hang', by, note);
  await order.save();
  return order;
}

export async function autoCompleteOrders() {
  const cutoff = new Date(Date.now() - config.autoCompleteDays * 86400000);
  const orders = await Order.find({ status: 'da_giao', deliveredAt: { $lt: cutoff } });
  let n = 0;
  for (const o of orders) {
    if (await AfterSales.exists({ order: o._id, status: 'cho_xu_ly' })) continue;
    await completeOrder(o, null);
    n++;
  }
  return n;
}

export const withinReturnWindow = (order) =>
  order.deliveredAt && Date.now() - new Date(order.deliveredAt).getTime() <= config.returnDays * 86400000;
