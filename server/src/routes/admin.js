import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import AppError from '../utils/AppError.js';
import { asyncHandler, parse, pageParams, paged, escapeRegex, zId, zEmail, zPhone, zPassword } from '../utils/helpers.js';
import { auth, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';
import Shop from '../models/Shop.js';
import Order from '../models/Order.js';
import { Category, Brand } from '../models/Catalog.js';
import { Product } from '../models/Product.js';
import { Voucher } from '../models/Voucher.js';
import { Complaint } from '../models/Support.js';
import * as orderSvc from '../services/orderService.js';
import { parseRange, summarize } from '../services/statsService.js';

const r = Router();
r.use(auth, requireRole('admin'));

// ======================= Thống kê toàn sàn =======================
// Không thu hoa hồng nên "doanh thu" ở đây là tổng giá trị giao dịch (GMV) của các đơn đã hoàn tất.
r.get('/stats', asyncHandler(async (req, res) => {
  const range = parseRange(req.query);
  const orders = await Order.find({ $or: [{ createdAt: { $gte: range.from, $lte: range.to } }, { completedAt: { $gte: range.from, $lte: range.to } }] }).lean();
  const s = summarize(orders, range, (o) => o.total);
  const done = orders.filter((o) => o.status === 'hoan_tat' && o.completedAt >= range.from && o.completedAt <= range.to);
  const byShop = new Map();
  for (const o of done) byShop.set(String(o.shop), (byShop.get(String(o.shop)) || 0) + o.sellerRevenue);
  const shops = await Shop.find({ _id: { $in: [...byShop.keys()] } }).select('name').lean();
  const [customers, activeShops, pendingShops, openComplaints] = await Promise.all([
    User.countDocuments({ role: 'customer', isDeleted: false }),
    Shop.countDocuments({ status: 'active' }),
    Shop.countDocuments({ status: 'pending' }),
    Complaint.countDocuments({ status: 'chuyen_admin' }),
  ]);
  res.json({
    ...s,
    gmv: s.revenue,
    platformDiscount: done.filter((o) => o.discountBy === 'platform').reduce((t, o) => t + o.discount, 0), // sàn đã chịu
    topShops: shops.map((sh) => ({ shop: sh._id, name: sh.name, revenue: byShop.get(String(sh._id)) })).sort((a, b) => b.revenue - a.revenue).slice(0, 10),
    totals: { customers, activeShops, pendingShops, complaintsWaitingAdmin: openComplaints },
  });
}));

// ======================= Khách hàng =======================
r.get('/customers', asyncHandler(async (req, res) => {
  const pg = pageParams(req.query, 20);
  const f = { role: 'customer', isDeleted: false };
  if (req.query.status) f.status = req.query.status;
  if (req.query.q) { const rx = { $regex: escapeRegex(req.query.q), $options: 'i' }; f.$or = [{ fullName: rx }, { email: rx }, { phone: rx }]; }
  const [items, total] = await Promise.all([User.find(f).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit).lean(), User.countDocuments(f)]);
  res.json(paged(items, total, pg));
}));
r.get('/customers/:id', asyncHandler(async (req, res) => {
  const u = await User.findOne({ _id: req.params.id, role: 'customer', isDeleted: false }).lean();
  if (!u) throw new AppError('Không tìm thấy khách hàng', 404);
  res.json(u);
}));
const setStatus = (role, from, to) => asyncHandler(async (req, res) => {
  const u = await User.findOne({ _id: req.params.id, role, isDeleted: false });
  if (!u) throw new AppError('Không tìm thấy tài khoản', 404);
  if (!from.includes(u.status)) throw new AppError('Trạng thái hiện tại không cho phép thao tác này', 400);
  u.status = to;
  await u.save();
  res.json(u);
});
r.patch('/customers/:id/lock', setStatus('customer', ['active'], 'locked'));
r.patch('/customers/:id/unlock', setStatus('customer', ['locked'], 'active'));

// ======================= Gian hàng / người bán =======================
r.get('/shops', asyncHandler(async (req, res) => {
  const pg = pageParams(req.query, 20);
  const f = {};
  if (req.query.status) f.status = req.query.status;
  if (req.query.q) f.name = { $regex: escapeRegex(req.query.q), $options: 'i' };
  const [items, total] = await Promise.all([Shop.find(f).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit).populate('owner', 'fullName email phone status').lean(), Shop.countDocuments(f)]);
  res.json(paged(items, total, pg));
}));
const shopAction = (from, to) => asyncHandler(async (req, res) => {
  const s = await Shop.findById(req.params.id);
  if (!s) throw new AppError('Không tìm thấy gian hàng', 404);
  if (!from.includes(s.status)) throw new AppError(`Gian hàng đang ở trạng thái "${s.status}", không thể thực hiện`, 400);
  if (to === 'rejected') s.rejectReason = parse(z.object({ reason: z.string().min(3).max(300) }), req.body).reason;
  s.status = to;
  await s.save();
  res.json(s);
});
r.patch('/shops/:id/approve', shopAction(['pending'], 'active'));
r.patch('/shops/:id/reject', shopAction(['pending'], 'rejected'));
r.patch('/shops/:id/lock', shopAction(['active'], 'locked'));
r.patch('/shops/:id/unlock', shopAction(['locked'], 'active'));

// ======================= Nhân viên CSKH =======================
r.get('/cskh', asyncHandler(async (_req, res) => {
  res.json(await User.find({ role: 'cskh', isDeleted: false }).sort({ createdAt: -1 }).lean());
}));
r.post('/cskh', asyncHandler(async (req, res) => {
  const d = parse(z.object({ fullName: z.string().min(2).max(80), email: zEmail, phone: zPhone, password: zPassword }), req.body);
  if (await User.exists({ email: d.email })) throw new AppError('Email đã được sử dụng', 409);
  res.status(201).json(await User.create({ ...d, passwordHash: await bcrypt.hash(d.password, 10), role: 'cskh' }));
}));
r.patch('/cskh/:id/lock', setStatus('cskh', ['active'], 'locked'));
r.patch('/cskh/:id/unlock', setStatus('cskh', ['locked'], 'active'));
r.delete('/cskh/:id', asyncHandler(async (req, res) => { // xóa mềm
  const u = await User.findOne({ _id: req.params.id, role: 'cskh', isDeleted: false });
  if (!u) throw new AppError('Không tìm thấy tài khoản', 404);
  u.isDeleted = true;
  u.status = 'locked';
  await u.save();
  res.json({ message: 'Đã xóa tài khoản CSKH' });
}));

// ======================= Voucher toàn sàn =======================
const voucherBase = z.object({
  code: z.string().min(3).max(30).regex(/^[A-Za-z0-9_-]+$/, 'Mã chỉ gồm chữ, số, gạch'),
  title: z.string().min(3).max(120),
  amount: z.number().int().min(1000),
  minOrder: z.number().int().min(0).default(0),
  quantity: z.number().int().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  pointsCost: z.number().int().min(0).default(0), // 0 = nhận miễn phí; >0 = đổi bằng điểm
});
r.get('/vouchers', asyncHandler(async (_req, res) => res.json(await Voucher.find({ scope: 'platform', isDeleted: false }).sort({ createdAt: -1 }).lean())));
r.post('/vouchers', asyncHandler(async (req, res) => {
  const d = parse(voucherBase.refine((v) => v.endDate > v.startDate, { message: 'Ngày kết thúc phải sau ngày bắt đầu', path: ['endDate'] }), req.body);
  if (await Voucher.exists({ code: d.code.toUpperCase() })) throw new AppError('Mã voucher đã tồn tại', 409);
  res.status(201).json(await Voucher.create({ ...d, scope: 'platform', remaining: d.quantity }));
}));
r.put('/vouchers/:id', asyncHandler(async (req, res) => {
  const v = await Voucher.findOne({ _id: req.params.id, scope: 'platform', isDeleted: false });
  if (!v) throw new AppError('Không tìm thấy voucher', 404);
  const d = parse(voucherBase.partial().extend({ active: z.boolean().optional() }), req.body);
  const claimed = v.quantity - v.remaining;
  if (d.quantity !== undefined) {
    if (d.quantity < claimed) throw new AppError(`Đã có ${claimed} lượt nhận/đổi, số lượng không được nhỏ hơn`, 400);
    v.remaining = d.quantity - claimed;
  }
  const { code, ...rest } = d;
  Object.assign(v, rest);
  if (v.endDate <= v.startDate) throw new AppError('Ngày kết thúc phải sau ngày bắt đầu', 400);
  await v.save();
  res.json(v);
}));
r.delete('/vouchers/:id', asyncHandler(async (req, res) => {
  const v = await Voucher.findOne({ _id: req.params.id, scope: 'platform', isDeleted: false });
  if (!v) throw new AppError('Không tìm thấy voucher', 404);
  v.isDeleted = true;
  await v.save();
  res.json({ message: 'Đã xóa voucher' });
}));

// ======================= Danh mục & thương hiệu =======================
r.post('/categories', asyncHandler(async (req, res) => {
  const d = parse(z.object({ name: z.string().min(2).max(80), parent: zId.nullable().optional() }), req.body);
  if (d.parent && !(await Category.exists({ _id: d.parent, isDeleted: false }))) throw new AppError('Danh mục cha không tồn tại', 400);
  res.status(201).json(await Category.create(d));
}));
r.put('/categories/:id', asyncHandler(async (req, res) => {
  const d = parse(z.object({ name: z.string().min(2).max(80).optional(), parent: zId.nullable().optional() }), req.body);
  if (d.parent && d.parent === req.params.id) throw new AppError('Danh mục không thể là cha của chính nó', 400);
  const c = await Category.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, d, { new: true });
  if (!c) throw new AppError('Không tìm thấy danh mục', 404);
  res.json(c);
}));
r.delete('/categories/:id', asyncHandler(async (req, res) => {
  if (await Category.exists({ parent: req.params.id, isDeleted: false })) throw new AppError('Danh mục còn danh mục con', 400);
  if (await Product.exists({ category: req.params.id, isDeleted: false })) throw new AppError('Danh mục còn sản phẩm đang bán', 400);
  const c = await Category.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true });
  if (!c) throw new AppError('Không tìm thấy danh mục', 404);
  res.json({ message: 'Đã xóa danh mục' });
}));
r.post('/brands', asyncHandler(async (req, res) => {
  res.status(201).json(await Brand.create(parse(z.object({ name: z.string().min(1).max(80), logo: z.string().optional() }), req.body)));
}));
r.put('/brands/:id', asyncHandler(async (req, res) => {
  const b = await Brand.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, parse(z.object({ name: z.string().min(1).max(80).optional(), logo: z.string().optional() }), req.body), { new: true });
  if (!b) throw new AppError('Không tìm thấy thương hiệu', 404);
  res.json(b);
}));
r.delete('/brands/:id', asyncHandler(async (req, res) => {
  if (await Product.exists({ brand: req.params.id, isDeleted: false })) throw new AppError('Thương hiệu còn sản phẩm đang bán', 400);
  const b = await Brand.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true });
  if (!b) throw new AppError('Không tìm thấy thương hiệu', 404);
  res.json({ message: 'Đã xóa thương hiệu' });
}));

// ======================= Đơn hàng toàn sàn (chỉ xem) =======================
r.get('/orders', asyncHandler(async (req, res) => {
  const pg = pageParams(req.query, 20);
  const f = {};
  if (req.query.status) f.status = req.query.status;
  if (req.query.shop) f.shop = req.query.shop;
  if (req.query.q) f.code = { $regex: escapeRegex(req.query.q), $options: 'i' };
  const [items, total] = await Promise.all([Order.find(f).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit).populate('shop', 'name').populate('customer', 'fullName').lean(), Order.countDocuments(f)]);
  res.json(paged(items, total, pg));
}));
r.get('/orders/:id', asyncHandler(async (req, res) => {
  const o = await Order.findById(req.params.id).populate('shop', 'name').populate('customer', 'fullName email phone').lean();
  if (!o) throw new AppError('Không tìm thấy đơn hàng', 404);
  res.json(o);
}));

// ======================= Khiếu nại do CSKH chuyển lên =======================
r.get('/complaints', asyncHandler(async (req, res) => {
  const pg = pageParams(req.query, 20);
  const f = { status: req.query.status || 'chuyen_admin' };
  const [items, total] = await Promise.all([Complaint.find(f).sort({ escalatedAt: -1, createdAt: -1 }).skip(pg.skip).limit(pg.limit).populate('assignedTo', 'fullName').lean(), Complaint.countDocuments(f)]);
  res.json(paged(items, total, pg));
}));
r.get('/complaints/:id', asyncHandler(async (req, res) => {
  const c = await Complaint.findById(req.params.id).populate('responses.by', 'fullName role').populate('customer', 'fullName email phone').populate('assignedTo', 'fullName').lean();
  if (!c) throw new AppError('Không tìm thấy đơn khiếu nại', 404);
  c.orderDetail = await Order.findById(c.order).populate('shop', 'name').lean();
  res.json(c);
}));
// Quyết định cuối cùng. forceRefund=true: ép hoàn tiền đơn hàng liên quan (khi đơn đã giao)
r.post('/complaints/:id/resolve', asyncHandler(async (req, res) => {
  const d = parse(z.object({ result: z.string().min(3).max(2000), forceRefund: z.boolean().optional() }), req.body);
  const c = await Complaint.findById(req.params.id);
  if (!c) throw new AppError('Không tìm thấy đơn khiếu nại', 404);
  if (c.status !== 'chuyen_admin') throw new AppError('Chỉ xử lý được đơn đã được CSKH chuyển lên', 400);
  if (d.forceRefund) {
    const o = await Order.findById(c.order);
    if (!o || !['da_giao', 'hoan_tat'].includes(o.status)) throw new AppError('Chỉ ép hoàn tiền được với đơn đã giao/hoàn tất', 400);
    await orderSvc.refundOrder(o, req.user._id, `Quản trị viên quyết định hoàn tiền (khiếu nại ${c.code})`);
  }
  c.status = 'da_xu_ly';
  c.result = d.result;
  c.resolvedBy = req.user._id;
  c.resolvedAt = new Date();
  c.responses.push({ by: req.user._id, role: 'admin', content: `Quyết định của quản trị viên: ${d.result}${d.forceRefund ? ' (đã hoàn tiền đơn hàng)' : ''}` });
  await c.save();
  res.json(c);
}));

export default r;
