import { Router } from 'express';
import { z } from 'zod';
import AppError from '../utils/AppError.js';
import { asyncHandler, parse, pageParams, paged, escapeRegex } from '../utils/helpers.js';
import { auth, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { Review, Complaint } from '../models/Support.js';
import { recalcRatings } from '../services/ratingService.js';

// Nhân viên CSKH
const r = Router();
r.use(auth, requireRole('cskh'));

// ---- Tra cứu khách hàng ----
r.get('/customers', asyncHandler(async (req, res) => {
  const pg = pageParams(req.query, 20);
  const f = { role: 'customer', isDeleted: false };
  if (req.query.q) {
    const rx = { $regex: escapeRegex(req.query.q), $options: 'i' };
    f.$or = [{ fullName: rx }, { email: rx }, { phone: rx }];
  }
  const [items, total] = await Promise.all([User.find(f).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit).select('fullName email phone status points createdAt').lean(), User.countDocuments(f)]);
  res.json(paged(items, total, pg));
}));
r.get('/customers/:id', asyncHandler(async (req, res) => {
  const u = await User.findOne({ _id: req.params.id, role: 'customer', isDeleted: false }).select('fullName email phone status points createdAt addresses').lean();
  if (!u) throw new AppError('Không tìm thấy khách hàng', 404);
  const orders = await Order.find({ customer: u._id }).sort({ createdAt: -1 }).limit(20).select('code status total createdAt shop').populate('shop', 'name').lean();
  res.json({ ...u, recentOrders: orders });
}));

// ---- Tra cứu đơn hàng (theo mã đơn, hoặc theo tên/email/SĐT khách) ----
r.get('/orders', asyncHandler(async (req, res) => {
  const pg = pageParams(req.query, 20);
  const f = {};
  if (req.query.status) f.status = req.query.status;
  if (req.query.q) {
    const rx = { $regex: escapeRegex(req.query.q), $options: 'i' };
    const users = await User.find({ role: 'customer', $or: [{ fullName: rx }, { email: rx }, { phone: rx }] }).select('_id').lean();
    f.$or = [{ code: rx }, { groupCode: rx }, { customer: { $in: users.map((u) => u._id) } }];
  }
  const [items, total] = await Promise.all([
    Order.find(f).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit).populate('customer', 'fullName phone').populate('shop', 'name').lean(),
    Order.countDocuments(f),
  ]);
  res.json(paged(items, total, pg));
}));
r.get('/orders/:id', asyncHandler(async (req, res) => {
  const o = await Order.findById(req.params.id).populate('customer', 'fullName email phone').populate('shop', 'name').lean();
  if (!o) throw new AppError('Không tìm thấy đơn hàng', 404);
  res.json(o);
}));

// ---- Đơn khiếu nại ----
// scope=pool: đơn mới chưa ai nhận | mine: đang xử lý của tôi (gồm cả đã chuyển admin) | history: tôi đã xử lý xong
r.get('/complaints', asyncHandler(async (req, res) => {
  const pg = pageParams(req.query, 20);
  const scope = req.query.scope || 'pool';
  const f = {
    pool: { status: 'moi' },
    mine: { assignedTo: req.user._id, status: { $in: ['dang_xu_ly', 'chuyen_admin'] } },
    history: { assignedTo: req.user._id, status: 'da_xu_ly' },
  }[scope];
  if (!f) throw new AppError('scope không hợp lệ (pool | mine | history)', 400);
  const [items, total] = await Promise.all([Complaint.find(f).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit).lean(), Complaint.countDocuments(f)]);
  res.json(paged(items, total, pg));
}));

const loadComplaint = async (req, { mustBeOpen = true } = {}) => {
  const c = await Complaint.findById(req.params.id);
  if (!c) throw new AppError('Không tìm thấy đơn khiếu nại', 404);
  if (c.assignedTo && String(c.assignedTo) !== String(req.user._id)) throw new AppError('Đơn này đang do nhân viên khác phụ trách', 403);
  if (mustBeOpen && !['moi', 'dang_xu_ly'].includes(c.status)) throw new AppError('Đơn khiếu nại không còn ở trạng thái xử lý của CSKH', 400);
  return c;
};

r.get('/complaints/:id', asyncHandler(async (req, res) => {
  const c = await Complaint.findById(req.params.id).populate('responses.by', 'fullName role').populate('customer', 'fullName email phone').lean();
  if (!c) throw new AppError('Không tìm thấy đơn khiếu nại', 404);
  if (c.assignedTo && String(c.assignedTo) !== String(req.user._id)) throw new AppError('Đơn này đang do nhân viên khác phụ trách', 403);
  c.orderDetail = await Order.findById(c.order).populate('shop', 'name').lean();
  res.json(c);
}));

// Phản hồi khách (lần phản hồi đầu tiên = nhận xử lý đơn)
r.post('/complaints/:id/respond', asyncHandler(async (req, res) => {
  const { content } = parse(z.object({ content: z.string().min(2).max(2000) }), req.body);
  const c = await loadComplaint(req);
  c.assignedTo = c.assignedTo || req.user._id;
  c.status = 'dang_xu_ly';
  c.responses.push({ by: req.user._id, role: 'cskh', content });
  await c.save();
  res.json(c);
}));

// Đã giải quyết xong
r.post('/complaints/:id/resolve', asyncHandler(async (req, res) => {
  const { result } = parse(z.object({ result: z.string().min(3).max(2000) }), req.body);
  const c = await loadComplaint(req);
  c.assignedTo = c.assignedTo || req.user._id;
  c.status = 'da_xu_ly';
  c.result = result;
  c.resolvedBy = req.user._id;
  c.resolvedAt = new Date();
  c.responses.push({ by: req.user._id, role: 'cskh', content: `Kết quả xử lý: ${result}` });
  await c.save();
  res.json(c);
}));

// Không xử lý được -> chuyển quản trị viên
r.post('/complaints/:id/escalate', asyncHandler(async (req, res) => {
  const { note } = parse(z.object({ note: z.string().min(3).max(2000) }), req.body);
  const c = await loadComplaint(req);
  c.assignedTo = c.assignedTo || req.user._id;
  c.status = 'chuyen_admin';
  c.escalateNote = note;
  c.escalatedAt = new Date();
  await c.save();
  res.json(c);
}));

// ---- Đánh giá của khách theo sản phẩm (CSKH được xóa đánh giá vi phạm) ----
r.get('/reviews', asyncHandler(async (req, res) => {
  const pg = pageParams(req.query, 20);
  const f = { isDeleted: false };
  if (req.query.product) f.product = req.query.product;
  if (req.query.rating) f.rating = Number(req.query.rating);
  const [items, total] = await Promise.all([
    Review.find(f).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit).populate('product', 'name').populate('customer', 'fullName').populate('shop', 'name').lean(),
    Review.countDocuments(f),
  ]);
  res.json(paged(items, total, pg));
}));
r.delete('/reviews/:id', asyncHandler(async (req, res) => {
  const rv = await Review.findOne({ _id: req.params.id, isDeleted: false });
  if (!rv) throw new AppError('Không tìm thấy đánh giá', 404);
  rv.isDeleted = true;
  rv.deletedBy = req.user._id;
  await rv.save();
  await recalcRatings(rv.product, rv.shop);
  res.json({ message: 'Đã xóa đánh giá' });
}));

export default r;
