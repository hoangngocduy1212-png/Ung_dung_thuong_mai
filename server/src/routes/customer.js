import { Router } from 'express';
import { z } from 'zod';
import AppError from '../utils/AppError.js';
import { asyncHandler, parse, pageParams, paged, genCode, zId, zPhone } from '../utils/helpers.js';
import { auth, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { Cart, Wishlist } from '../models/Cart.js';
import { Product, Variant } from '../models/Product.js';
import Shop from '../models/Shop.js';
import { UserVoucher, PointTx } from '../models/Voucher.js';
import { Review, AfterSales, Complaint } from '../models/Support.js';
import * as orderSvc from '../services/orderService.js';
import * as voucherSvc from '../services/voucherService.js';
import { recalcRatings } from '../services/ratingService.js';

const r = Router();
r.use(auth, requireRole('customer'));

// ======================= Tài khoản cá nhân =======================
r.get('/profile', (req, res) => res.json(req.user));

r.put('/profile', asyncHandler(async (req, res) => {
  const d = parse(z.object({ fullName: z.string().min(2).max(80).optional(), phone: zPhone.optional() }), req.body);
  Object.assign(req.user, d);
  await req.user.save();
  res.json(req.user);
}));

const addressSchema = z.object({
  receiver: z.string().min(2), phone: zPhone, detail: z.string().min(3),
  ward: z.string().optional(), district: z.string().optional(), province: z.string().optional(), isDefault: z.boolean().optional(),
});
const setDefault = (user, addr) => { if (addr.isDefault) user.addresses.forEach((a) => { if (a !== addr) a.isDefault = false; }); };

r.get('/addresses', (req, res) => res.json(req.user.addresses));
r.post('/addresses', asyncHandler(async (req, res) => {
  const d = parse(addressSchema, req.body);
  if (!req.user.addresses.length) d.isDefault = true;
  req.user.addresses.push(d);
  setDefault(req.user, req.user.addresses[req.user.addresses.length - 1]);
  await req.user.save();
  res.status(201).json(req.user.addresses);
}));
r.put('/addresses/:id', asyncHandler(async (req, res) => {
  const a = req.user.addresses.id(req.params.id);
  if (!a) throw new AppError('Không tìm thấy địa chỉ', 404);
  a.set(parse(addressSchema.partial(), req.body));
  setDefault(req.user, a);
  await req.user.save();
  res.json(req.user.addresses);
}));
r.delete('/addresses/:id', asyncHandler(async (req, res) => {
  const a = req.user.addresses.id(req.params.id);
  if (!a) throw new AppError('Không tìm thấy địa chỉ', 404);
  a.deleteOne();
  await req.user.save();
  res.json(req.user.addresses);
}));

// ======================= Giỏ hàng =======================
async function cartView(userId) {
  const cart = (await Cart.findOne({ user: userId })) || { items: [] };
  const variants = await Variant.find({ _id: { $in: cart.items.map((i) => i.variant) } }).lean();
  const products = await Product.find({ _id: { $in: cart.items.map((i) => i.product) } }).populate('shop', 'name status').lean();
  const vm = new Map(variants.map((v) => [String(v._id), v]));
  const pm = new Map(products.map((p) => [String(p._id), p]));
  const items = cart.items.map((i) => {
    const v = vm.get(String(i.variant));
    const p = pm.get(String(i.product));
    const available = !!(v && p && !v.isDeleted && !p.isDeleted && !p.hidden && p.shop?.status === 'active' && v.stock > 0);
    return {
      _id: i._id, product: i.product, variant: i.variant, quantity: i.quantity,
      productName: p?.name, variantName: v?.name, image: p?.images?.[0], price: v?.price, stock: v?.stock ?? 0,
      shop: p ? { _id: p.shop?._id, name: p.shop?.name } : null,
      available, lineTotal: available ? v.price * i.quantity : 0,
    };
  });
  return { items, total: items.reduce((s, i) => s + i.lineTotal, 0) };
}

r.get('/cart', asyncHandler(async (req, res) => res.json(await cartView(req.user._id))));

r.post('/cart/items', asyncHandler(async (req, res) => {
  const d = parse(z.object({ productId: zId, variantId: zId, quantity: z.number().int().min(1).max(99).default(1) }), req.body);
  const v = await Variant.findOne({ _id: d.variantId, product: d.productId, isDeleted: false });
  const p = await Product.findOne({ _id: d.productId, isDeleted: false, hidden: false });
  const shop = p && (await Shop.findOne({ _id: p.shop, status: 'active' }));
  if (!v || !p || !shop) throw new AppError('Sản phẩm không tồn tại hoặc đã ngừng bán', 404);
  const cart = (await Cart.findOne({ user: req.user._id })) || new Cart({ user: req.user._id, items: [] });
  const ex = cart.items.find((i) => String(i.variant) === d.variantId);
  const newQty = (ex?.quantity || 0) + d.quantity;
  if (newQty > v.stock) throw new AppError(v.stock === 0 ? 'Sản phẩm đã hết hàng' : `Chỉ còn ${v.stock} sản phẩm trong kho`, 409);
  if (ex) ex.quantity = newQty;
  else cart.items.push({ product: d.productId, variant: d.variantId, quantity: d.quantity });
  await cart.save();
  res.status(201).json(await cartView(req.user._id));
}));

r.patch('/cart/items/:itemId', asyncHandler(async (req, res) => {
  const { quantity } = parse(z.object({ quantity: z.number().int().min(1).max(99) }), req.body);
  const cart = await Cart.findOne({ user: req.user._id });
  const it = cart?.items.id(req.params.itemId);
  if (!it) throw new AppError('Không có sản phẩm này trong giỏ', 404);
  const v = await Variant.findById(it.variant);
  if (!v || v.isDeleted || quantity > v.stock) throw new AppError(`Chỉ còn ${v?.stock ?? 0} sản phẩm trong kho`, 409);
  it.quantity = quantity;
  await cart.save();
  res.json(await cartView(req.user._id));
}));

r.delete('/cart/items/:itemId', asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  const it = cart?.items.id(req.params.itemId);
  if (!it) throw new AppError('Không có sản phẩm này trong giỏ', 404);
  it.deleteOne();
  await cart.save();
  res.json(await cartView(req.user._id));
}));

// ======================= Yêu thích =======================
r.get('/wishlist', asyncHandler(async (req, res) => {
  const w = await Wishlist.findOne({ user: req.user._id });
  const items = await Product.find({ _id: { $in: w?.products || [] }, isDeleted: false, hidden: false }).populate('shop', 'name').lean();
  res.json(items);
}));
r.post('/wishlist/:productId', asyncHandler(async (req, res) => {
  const p = await Product.findOne({ _id: req.params.productId, isDeleted: false });
  if (!p) throw new AppError('Sản phẩm không tồn tại', 404);
  await Wishlist.updateOne({ user: req.user._id }, { $addToSet: { products: p._id } }, { upsert: true });
  res.status(201).json({ message: 'Đã thêm vào yêu thích' });
}));
r.delete('/wishlist/:productId', asyncHandler(async (req, res) => {
  await Wishlist.updateOne({ user: req.user._id }, { $pull: { products: req.params.productId } });
  res.json({ message: 'Đã bỏ khỏi yêu thích' });
}));

// ======================= Voucher & điểm =======================
r.get('/vouchers/available', asyncHandler(async (req, res) => res.json(await voucherSvc.listAvailable(req.user._id, { shopId: req.query.shop }))));
r.post('/vouchers/:id/claim', asyncHandler(async (req, res) => res.status(201).json(await voucherSvc.claim(req.user, req.params.id))));
r.post('/vouchers/:id/redeem', asyncHandler(async (req, res) => {
  const uv = await voucherSvc.redeemWithPoints(req.user, req.params.id);
  const u = await User.findById(req.user._id).select('points');
  res.status(201).json({ userVoucher: uv, points: u.points });
}));
// Voucher của tôi. ?status=unused|used
r.get('/my-vouchers', asyncHandler(async (req, res) => {
  const f = { user: req.user._id };
  if (req.query.status) f.status = req.query.status;
  const list = await UserVoucher.find(f).sort({ createdAt: -1 }).populate('voucher').lean();
  const now = new Date();
  res.json(list.filter((x) => x.voucher).map((x) => ({ ...x, expired: x.voucher.endDate <= now })));
}));
r.get('/points', asyncHandler(async (req, res) => {
  const u = await User.findById(req.user._id).select('points');
  res.json({ points: u.points, history: await PointTx.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100).lean() });
}));

// ======================= Đặt hàng =======================
r.post('/orders/checkout', asyncHandler(async (req, res) => {
  const d = parse(z.object({
    cartItemIds: z.array(z.string()).optional(),
    addressId: z.string().optional(),
    address: addressSchema.optional(),
    paymentMethod: z.enum(['cod', 'online']),
    note: z.string().max(500).optional(),
    vouchers: z.record(zId, zId).optional(), // { shopId: userVoucherId }
  }), req.body);
  let address = d.address;
  if (d.addressId) {
    const a = req.user.addresses.id(d.addressId);
    if (!a) throw new AppError('Không tìm thấy địa chỉ giao hàng', 404);
    address = a.toObject();
  }
  if (!address) throw new AppError('Vui lòng chọn hoặc nhập địa chỉ giao hàng', 400);
  const { receiver, phone, detail, ward, district, province } = address;
  const orders = await orderSvc.checkout(req.user, { ...d, address: { receiver, phone, detail, ward, district, province } });
  res.status(201).json({ groupCode: orders[0].groupCode, orders });
}));

// Thanh toán online (giả lập) cho cả nhóm đơn vừa đặt
r.post('/orders/group/:groupCode/pay', asyncHandler(async (req, res) => res.json({ orders: await orderSvc.payGroup(req.user, req.params.groupCode) })));

r.get('/orders', asyncHandler(async (req, res) => {
  const pg = pageParams(req.query, 10);
  const f = { customer: req.user._id };
  if (req.query.status) f.status = req.query.status;
  const [items, total] = await Promise.all([
    Order.find(f).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit).populate('shop', 'name logo').lean(),
    Order.countDocuments(f),
  ]);
  res.json(paged(items, total, pg));
}));

const myOrder = async (req) => {
  const o = await Order.findOne({ _id: req.params.id, customer: req.user._id });
  if (!o) throw new AppError('Không tìm thấy đơn hàng', 404);
  return o;
};

r.get('/orders/:id', asyncHandler(async (req, res) => {
  const o = await Order.findOne({ _id: req.params.id, customer: req.user._id }).populate('shop', 'name logo').lean();
  if (!o) throw new AppError('Không tìm thấy đơn hàng', 404);
  const [afterSales, reviews] = await Promise.all([
    AfterSales.find({ order: o._id }).sort({ createdAt: -1 }).lean(),
    Review.find({ order: o._id, isDeleted: false }).select('product').lean(),
  ]);
  res.json({ ...o, afterSales, reviewedProducts: reviews.map((x) => String(x.product)) });
}));

// Hủy đơn khi còn "Chờ xác nhận". Đơn đã xác nhận (chưa giao) thì gửi yêu cầu hủy qua /after-sales
r.post('/orders/:id/cancel', asyncHandler(async (req, res) => {
  const { reason } = parse(z.object({ reason: z.string().min(3).max(300) }), req.body);
  const o = await myOrder(req);
  if (o.status !== 'cho_xac_nhan') throw new AppError('Đơn đã được xác nhận, vui lòng gửi yêu cầu hủy đơn để gian hàng duyệt', 400);
  res.json(await orderSvc.cancelOrder(o, req.user._id, reason));
}));

// Khách xác nhận đã nhận hàng -> Hoàn tất -> cộng điểm, được phép đánh giá
r.post('/orders/:id/confirm-received', asyncHandler(async (req, res) => {
  const o = await myOrder(req);
  if (o.status !== 'da_giao') throw new AppError('Chỉ xác nhận được khi đơn ở trạng thái "Đã giao"', 400);
  if (await AfterSales.exists({ order: o._id, status: 'cho_xu_ly' })) throw new AppError('Đơn đang có yêu cầu sau bán hàng chưa xử lý', 400);
  res.json(await orderSvc.completeOrder(o, req.user._id));
}));

// ======================= Hủy (đã xác nhận) / Hoàn tiền / Đổi trả =======================
r.post('/orders/:id/after-sales', asyncHandler(async (req, res) => {
  const d = parse(z.object({ type: z.enum(['huy_don', 'hoan_tien', 'doi_hang']), reason: z.string().min(5).max(500) }), req.body);
  const o = await myOrder(req);
  if (d.type === 'huy_don') {
    if (o.status !== 'da_xac_nhan') throw new AppError('Chỉ gửi yêu cầu hủy khi đơn đã xác nhận nhưng chưa giao. Đơn đang chờ xác nhận có thể tự hủy.', 400);
  } else {
    if (!['da_giao', 'hoan_tat'].includes(o.status)) throw new AppError('Chỉ yêu cầu đổi trả/hoàn tiền sau khi đã nhận hàng', 400);
    if (!orderSvc.withinReturnWindow(o)) throw new AppError('Đã quá thời hạn đổi trả/hoàn tiền', 400);
  }
  if (await AfterSales.exists({ order: o._id, status: 'cho_xu_ly' })) throw new AppError('Đơn này đã có yêu cầu đang chờ xử lý', 409);
  if (await AfterSales.exists({ order: o._id, type: { $in: ['hoan_tien'] }, status: 'da_chap_nhan' })) throw new AppError('Đơn này đã được hoàn tiền', 409);
  const a = await AfterSales.create({ order: o._id, customer: req.user._id, shop: o.shop, ...d });
  res.status(201).json(a);
}));
r.get('/after-sales', asyncHandler(async (req, res) => {
  res.json(await AfterSales.find({ customer: req.user._id }).sort({ createdAt: -1 }).populate('order', 'code total').lean());
}));

// ======================= Đánh giá (sau khi nhận hàng) =======================
r.post('/reviews', asyncHandler(async (req, res) => {
  const d = parse(z.object({ orderId: zId, productId: zId, rating: z.number().int().min(1).max(5), content: z.string().max(1000).optional() }), req.body);
  const o = await Order.findOne({ _id: d.orderId, customer: req.user._id });
  if (!o) throw new AppError('Không tìm thấy đơn hàng', 404);
  if (o.status !== 'hoan_tat') throw new AppError('Chỉ đánh giá được sau khi đã nhận hàng (đơn hoàn tất)', 400);
  const item = o.items.find((i) => String(i.product) === d.productId);
  if (!item) throw new AppError('Sản phẩm không thuộc đơn hàng này', 400);
  if (await Review.exists({ order: o._id, product: d.productId })) throw new AppError('Bạn đã đánh giá sản phẩm này trong đơn hàng này', 409);
  const rv = await Review.create({ order: o._id, product: d.productId, shop: o.shop, customer: req.user._id, variantName: item.variantName, rating: d.rating, content: d.content });
  await recalcRatings(d.productId, o.shop);
  res.status(201).json(rv);
}));

// ======================= Khiếu nại (gửi theo dạng đơn tới CSKH) =======================
r.post('/complaints', asyncHandler(async (req, res) => {
  const d = parse(z.object({
    contactName: z.string().min(2), contactPhone: zPhone, contactEmail: z.string().email().optional(),
    orderCode: z.string().min(5), reason: z.string().min(10, 'Vui lòng mô tả lý do tối thiểu 10 ký tự').max(2000),
  }), req.body);
  const o = await Order.findOne({ code: d.orderCode.trim().toUpperCase(), customer: req.user._id });
  if (!o) throw new AppError('Mã đơn hàng không tồn tại trong tài khoản của bạn', 404);
  const c = await Complaint.create({ ...d, code: genCode('KN'), orderCode: o.code, order: o._id, customer: req.user._id });
  res.status(201).json(c);
}));
r.get('/complaints', asyncHandler(async (req, res) => {
  res.json(await Complaint.find({ customer: req.user._id }).sort({ createdAt: -1 }).lean());
}));
r.get('/complaints/:id', asyncHandler(async (req, res) => {
  const c = await Complaint.findOne({ _id: req.params.id, customer: req.user._id }).populate('responses.by', 'fullName role').lean();
  if (!c) throw new AppError('Không tìm thấy đơn khiếu nại', 404);
  res.json(c);
}));

export default r;
