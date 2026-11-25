import { Router } from 'express';
import { z } from 'zod';
import AppError from '../utils/AppError.js';
import { asyncHandler, parse, pageParams, paged, escapeRegex, zId } from '../utils/helpers.js';
import { auth, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';
import Order, { ORDER_STATUS } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Review, Complaint, AfterSales } from '../models/Support.js';
import { recalcRatings } from '../services/ratingService.js';

// Nhân viên CSKH
const r = Router();
r.use(auth, requireRole('cskh'));

const positiveInteger = z.string().regex(/^[1-9]\d*$/).refine((value) => Number.isSafeInteger(Number(value)) && Number(value) <= Math.floor(Number.MAX_SAFE_INTEGER / 100), 'Giá trị phân trang quá lớn');
const querySchema = z.object({
  q: z.string().trim().max(200).optional(),
  scope: z.enum(['pool', 'mine', 'history']).optional(),
  status: z.enum(ORDER_STATUS).optional(),
  product: zId.optional(),
  rating: z.enum(['1', '2', '3', '4', '5']).optional(),
  page: positiveInteger.optional(),
  limit: positiveInteger.optional(),
});
// Không đưa object/toán tử từ query string vào bộ lọc MongoDB.
// scope chỉ nhận enum, tránh truy cập các thuộc tính kế thừa như __proto__.
r.use((req, _res, next) => {
  req.query = parse(querySchema, req.query);
  next();
});

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
  const [afterSales, complaints] = await Promise.all([
    AfterSales.find({ order: o._id }).sort({ createdAt: -1 }).lean(),
    Complaint.find({ order: o._id }).sort({ createdAt: -1 }).lean(),
  ]);
  o.afterSales = afterSales;
  o.complaints = complaints;
  res.json(o);
}));

// ---- Tổng quan số liệu hàng đợi CSKH ----
r.get('/summary', asyncHandler(async (req, res) => {
  const [pool, mine, history] = await Promise.all([
    Complaint.countDocuments({ status: 'moi' }),
    Complaint.countDocuments({ assignedTo: req.user._id, status: { $in: ['dang_xu_ly', 'chuyen_admin'] } }),
    Complaint.countDocuments({ assignedTo: req.user._id, status: 'da_xu_ly' }),
  ]);
  res.json({ pool, mine, history });
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
  if (req.query.q) {
    const rx = { $regex: escapeRegex(req.query.q), $options: 'i' };
    f.$or = ['code', 'orderCode', 'contactName', 'contactPhone', 'contactEmail', 'reason'].map((key) => ({ [key]: rx }));
  }
  const sort = scope === 'history' ? { resolvedAt: -1, _id: -1 } : { createdAt: -1, _id: -1 };
  const [items, total] = await Promise.all([Complaint.find(f).sort(sort).skip(pg.skip).limit(pg.limit).lean(), Complaint.countDocuments(f)]);
  res.json(paged(items, total, pg));
}));

// Nhận quyền phụ trách và cập nhật trong CÙNG một thao tác nguyên tử.
// Hai nhân viên đọc một đơn mới đồng thời cũng chỉ có một người nhận được đơn.
const updateComplaint = async (req, update) => {
  const updated = await Complaint.findOneAndUpdate({
    _id: req.params.id,
    status: { $in: ['moi', 'dang_xu_ly'] },
    $or: [{ assignedTo: null }, { assignedTo: req.user._id }],
  }, { ...update, $set: { ...update.$set, assignedTo: req.user._id } }, { new: true, runValidators: true });
  if (updated) return updated;
  const c = await Complaint.findById(req.params.id);
  if (!c) throw new AppError('Không tìm thấy đơn khiếu nại', 404);
  if (c.assignedTo && String(c.assignedTo) !== String(req.user._id)) throw new AppError('Đơn này đang do nhân viên khác phụ trách', 403);
  if (!['moi', 'dang_xu_ly'].includes(c.status)) throw new AppError('Đơn khiếu nại không còn ở trạng thái xử lý của CSKH', 400);
  throw new AppError('Đơn khiếu nại vừa được cập nhật, vui lòng tải lại', 409);
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
  const { content } = parse(z.object({ content: z.string().trim().min(2).max(2000) }), req.body);
  const c = await updateComplaint(req, {
    $set: { status: 'dang_xu_ly' },
    $push: { responses: { by: req.user._id, role: 'cskh', content, at: new Date() } },
  });
  res.json(c);
}));

// Đã giải quyết xong
r.post('/complaints/:id/resolve', asyncHandler(async (req, res) => {
  const { result } = parse(z.object({ result: z.string().trim().min(3).max(2000) }), req.body);
  const c = await updateComplaint(req, {
    $set: { status: 'da_xu_ly', result, resolvedBy: req.user._id, resolvedAt: new Date() },
    $push: { responses: { by: req.user._id, role: 'cskh', content: `Kết quả xử lý: ${result}`, at: new Date() } },
  });
  res.json(c);
}));

// Không xử lý được -> chuyển quản trị viên
r.post('/complaints/:id/escalate', asyncHandler(async (req, res) => {
  const { note } = parse(z.object({ note: z.string().trim().min(3).max(2000) }), req.body);
  const c = await updateComplaint(req, {
    $set: { status: 'chuyen_admin', escalateNote: note, escalatedAt: new Date() },
  });
  res.json(c);
}));

// ---- Đánh giá của khách theo sản phẩm (CSKH được xóa đánh giá vi phạm) ----
r.get('/reviews', asyncHandler(async (req, res) => {
  const pg = pageParams(req.query, 20);
  const f = { isDeleted: false };
  if (req.query.product) f.product = req.query.product;
  if (req.query.q) {
    const products = await Product.find({ name: { $regex: escapeRegex(req.query.q), $options: 'i' } }).select('_id').lean();
    // Kết hợp cả bộ lọc ID và tên, kể cả sản phẩm đã ẩn/xóa mềm.
    f.$and = [{ product: { $in: products.map((p) => p._id) } }];
  }
  if (req.query.rating) f.rating = Number(req.query.rating);
  const [items, total] = await Promise.all([
    Review.find(f).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit).populate('product', 'name').populate('customer', 'fullName').populate('shop', 'name').lean(),
    Review.countDocuments(f),
  ]);
  res.json(paged(items, total, pg));
}));
r.delete('/reviews/:id', asyncHandler(async (req, res) => {
  const rv = await Review.findOneAndUpdate({ _id: req.params.id, isDeleted: false },
    { $set: { isDeleted: true, deletedBy: req.user._id } }, { new: true });
  if (!rv) throw new AppError('Không tìm thấy đánh giá', 404);
  await recalcRatings(rv.product, rv.shop);
  res.json({ message: 'Đã xóa đánh giá' });
}));

export default r;
