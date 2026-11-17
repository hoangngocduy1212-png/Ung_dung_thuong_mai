import { Router } from 'express';
import { z } from 'zod';
import AppError from '../utils/AppError.js';
import { asyncHandler, parse, pageParams, paged, escapeRegex, zId, zPhone } from '../utils/helpers.js';
import { auth, requireRole, requireOwner, requireActiveShop } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import User from '../models/User.js';
import Shop from '../models/Shop.js';
import Order from '../models/Order.js';
import { Category, Brand } from '../models/Catalog.js';
import { Product, Variant } from '../models/Product.js';
import { Voucher } from '../models/Voucher.js';
import { Review, AfterSales } from '../models/Support.js';
import * as orderSvc from '../services/orderService.js';
import { recalcRatings } from '../services/ratingService.js';
import { parseRange, summarize } from '../services/statsService.js';

const r = Router();
r.use(auth, requireRole('seller'));

// Hồ sơ người bán dùng lại các trường tài khoản hiện có, không tạo dữ liệu hồ sơ trùng.
r.get('/profile', (req, res) => res.json(req.user));
r.put('/profile', asyncHandler(async (req, res) => {
  const d = parse(z.object({ fullName: z.string().min(2).max(80).optional(), phone: zPhone.optional() }), req.body);
  Object.assign(req.user, d);
  await req.user.save();
  res.json(req.user);
}));

// ======================= Gian hàng =======================
// Xem thông tin gian hàng (kể cả khi đang chờ duyệt để biết trạng thái)
r.get('/shop', asyncHandler(async (req, res) => res.json(await Shop.findById(req.user.shop).lean())));

// Chỉ chủ gian hàng sửa thông tin gian hàng
r.put('/shop', requireOwner, requireActiveShop, asyncHandler(async (req, res) => {
  const d = parse(z.object({ logo: z.string().optional(), description: z.string().max(2000).optional(), policy: z.string().max(3000).optional() }), req.body);
  Object.assign(req.shop, d);
  await req.shop.save();
  res.json(req.shop);
}));

// Tên gian hàng không đổi sau khi đăng ký để giữ quy tắc "mỗi gian hàng chỉ có 1 chủ"
r.post('/upload', requireActiveShop, upload.single('image'), (req, res) => {
  if (!req.file) throw new AppError('Chưa chọn ảnh', 400);
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

// ======================= Nhân viên của gian hàng (chủ quản lý) =======================
r.get('/staff', requireOwner, asyncHandler(async (req, res) => {
  res.json(await User.find({ shop: req.user.shop, sellerRole: 'staff', isDeleted: false }).sort({ createdAt: -1 }).lean());
}));
const staffAction = (from, to) => asyncHandler(async (req, res) => {
  const u = await User.findOne({ _id: req.params.id, shop: req.user.shop, sellerRole: 'staff', isDeleted: false });
  if (!u) throw new AppError('Không tìm thấy nhân viên', 404);
  if (!from.includes(u.status)) throw new AppError('Trạng thái hiện tại không cho phép thao tác này', 400);
  u.status = to;
  await u.save();
  res.json(u);
});
r.patch('/staff/:id/approve', requireOwner, requireActiveShop, staffAction(['pending'], 'active'));
r.patch('/staff/:id/reject', requireOwner, requireActiveShop, staffAction(['pending'], 'rejected'));
r.patch('/staff/:id/lock', requireOwner, requireActiveShop, staffAction(['active'], 'locked'));
r.patch('/staff/:id/unlock', requireOwner, requireActiveShop, staffAction(['locked'], 'active'));

// Từ đây trở xuống: gian hàng phải đang hoạt động
r.use(requireActiveShop);

// ======================= Sản phẩm =======================
const variantIn = z.object({ _id: zId.optional(), name: z.string().min(1).max(100), sku: z.string().max(50).optional(), price: z.number().min(1000), stock: z.number().int().min(0).optional() });
const productIn = z.object({
  name: z.string().min(3).max(200),
  description: z.string().max(10000).default(''),
  category: zId,
  brand: zId.optional(),
  images: z.array(z.string()).max(10).default([]),
  variants: z.array(variantIn).min(1, 'Cần ít nhất 1 biến thể (phiên bản) sản phẩm'),
});

async function checkRefs(d) {
  if (d.category && !(await Category.exists({ _id: d.category, isDeleted: false }))) throw new AppError('Danh mục không tồn tại', 400);
  if (d.brand && !(await Brand.exists({ _id: d.brand, isDeleted: false }))) throw new AppError('Thương hiệu không tồn tại', 400);
}
const refreshMinPrice = async (productId) => {
  const vs = await Variant.find({ product: productId, isDeleted: false }).select('price').lean();
  await Product.updateOne({ _id: productId }, { minPrice: vs.length ? Math.min(...vs.map((v) => v.price)) : 0 });
};
const ownProduct = async (req) => {
  const p = await Product.findOne({ _id: req.params.id, shop: req.shop._id, isDeleted: false });
  if (!p) throw new AppError('Không tìm thấy sản phẩm', 404);
  return p;
};
const withVariants = async (products) => {
  const vs = await Variant.find({ product: { $in: products.map((p) => p._id) }, isDeleted: false }).lean();
  return products.map((p) => ({ ...p, variants: vs.filter((v) => String(v.product) === String(p._id)) }));
};

r.get('/products', asyncHandler(async (req, res) => {
  const pg = pageParams(req.query, 20);
  const f = { shop: req.shop._id, isDeleted: false };
  if (req.query.q) f.name = { $regex: escapeRegex(req.query.q), $options: 'i' };
  if (req.query.hidden === 'true') f.hidden = true;
  if (req.query.hidden === 'false') f.hidden = false;
  const [items, total] = await Promise.all([
    Product.find(f).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit).populate('category', 'name').populate('brand', 'name').lean(),
    Product.countDocuments(f),
  ]);
  res.json(paged(await withVariants(items), total, pg));
}));

r.get('/products/:id', asyncHandler(async (req, res) => {
  const p = await Product.findOne({ _id: req.params.id, shop: req.shop._id, isDeleted: false }).lean();
  if (!p) throw new AppError('Không tìm thấy sản phẩm', 404);
  res.json((await withVariants([p]))[0]);
}));

r.post('/products', asyncHandler(async (req, res) => {
  const d = parse(productIn, req.body);
  await checkRefs(d);
  const { variants, ...rest } = d;
  const p = await Product.create({ ...rest, shop: req.shop._id, minPrice: Math.min(...variants.map((v) => v.price)) });
  try {
    await Variant.insertMany(variants.map((v) => ({ product: p._id, name: v.name, sku: v.sku, price: v.price, stock: v.stock ?? 0 })));
  } catch (error) {
    await Product.deleteOne({ _id: p._id, shop: req.shop._id });
    throw error;
  }
  res.status(201).json((await withVariants([p.toObject()]))[0]);
}));

// Sửa sản phẩm + đồng bộ biến thể: có _id = sửa, không có _id = thêm mới, biến thể bị bỏ đi = xóa mềm.
// Số lượng tồn của biến thể ĐÃ CÓ chỉ sửa qua API tồn kho (tránh ghi đè khi có khách đang đặt hàng).
r.put('/products/:id', asyncHandler(async (req, res) => {
  const p = await ownProduct(req);
  const d = parse(productIn.partial(), req.body);
  await checkRefs(d);
  const { variants, ...rest } = d;
  if (variants) {
    const existing = await Variant.find({ product: p._id, isDeleted: false });
    // Xác minh tất cả ID trước khi ghi bất kỳ thay đổi nào lên sản phẩm/biến thể.
    if (variants.some((v) => v._id && !existing.some((e) => String(e._id) === v._id))) {
      throw new AppError('Biến thể không thuộc sản phẩm này', 400);
    }
    Object.assign(p, rest);
    await p.save();
    const keep = new Set();
    for (const v of variants) {
      if (v._id) {
        const ex = existing.find((e) => String(e._id) === v._id);
        ex.name = v.name; ex.sku = v.sku; ex.price = v.price;
        await ex.save();
        keep.add(v._id);
      } else {
        const nv = await Variant.create({ product: p._id, name: v.name, sku: v.sku, price: v.price, stock: v.stock ?? 0 });
        keep.add(String(nv._id));
      }
    }
    for (const ex of existing) if (!keep.has(String(ex._id))) { ex.isDeleted = true; await ex.save(); }
  } else {
    Object.assign(p, rest);
    await p.save();
  }
  await refreshMinPrice(p._id);
  res.json((await withVariants([(await Product.findById(p._id)).toObject()]))[0]);
}));

r.patch('/products/:id/visibility', asyncHandler(async (req, res) => {
  const { hidden } = parse(z.object({ hidden: z.boolean() }), req.body);
  const p = await ownProduct(req);
  p.hidden = hidden;
  await p.save();
  res.json(p);
}));

// Xóa mềm: đơn hàng cũ vẫn giữ nguyên thông tin sản phẩm
r.delete('/products/:id', asyncHandler(async (req, res) => {
  const p = await ownProduct(req);
  p.isDeleted = true;
  await p.save();
  res.json({ message: 'Đã xóa sản phẩm' });
}));

// ======================= Tồn kho (theo biến thể) =======================
r.get('/inventory', asyncHandler(async (req, res) => {
  const products = await Product.find({ shop: req.shop._id, isDeleted: false }).select('name images').lean();
  const pm = new Map(products.map((p) => [String(p._id), p]));
  const f = { product: { $in: products.map((p) => p._id) }, isDeleted: false };
  if (req.query.threshold) f.stock = { $lte: Number(req.query.threshold) };
  const vs = await Variant.find(f).sort({ stock: 1 }).lean();
  res.json(vs.map((v) => ({ ...v, productName: pm.get(String(v.product))?.name, image: pm.get(String(v.product))?.images?.[0] })));
}));

// body: { stock: 50 } (đặt lại) hoặc { delta: -3 } (nhập/xuất thêm)
r.patch('/products/:id/variants/:variantId/stock', asyncHandler(async (req, res) => {
  const d = parse(z.object({ stock: z.number().int().min(0).optional(), delta: z.number().int().optional() }).refine((x) => (x.stock === undefined) !== (x.delta === undefined), 'Chỉ truyền stock hoặc delta'), req.body);
  const p = await ownProduct(req);
  const where = { _id: req.params.variantId, product: p._id, isDeleted: false };
  const upd = d.stock !== undefined
    ? await Variant.updateOne(where, { $set: { stock: d.stock } })
    : await Variant.updateOne({ ...where, stock: { $gte: -d.delta } }, { $inc: { stock: d.delta } });
  if (!upd.modifiedCount && !(upd.matchedCount && d.stock !== undefined)) throw new AppError('Không cập nhật được (biến thể không tồn tại hoặc tồn kho không đủ để trừ)', 400);
  res.json(await Variant.findById(req.params.variantId));
}));

// ======================= Đơn hàng =======================
r.get('/orders', asyncHandler(async (req, res) => {
  const pg = pageParams(req.query, 20);
  const f = { shop: req.shop._id };
  if (req.query.status) f.status = req.query.status;
  if (req.query.q) f.code = { $regex: escapeRegex(req.query.q), $options: 'i' };
  const [items, total] = await Promise.all([Order.find(f).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit).lean(), Order.countDocuments(f)]);
  res.json(paged(items, total, pg));
}));

const shopOrder = async (req) => {
  const o = await Order.findOne({ _id: req.params.id, shop: req.shop._id });
  if (!o) throw new AppError('Không tìm thấy đơn hàng', 404);
  return o;
};

r.get('/orders/:id', asyncHandler(async (req, res) => {
  const o = await Order.findOne({ _id: req.params.id, shop: req.shop._id }).populate('customer', 'fullName phone').lean();
  if (!o) throw new AppError('Không tìm thấy đơn hàng', 404);
  o.afterSales = await AfterSales.find({ order: o._id }).sort({ createdAt: -1 }).lean();
  res.json(o);
}));

const NEXT = { cho_xac_nhan: 'da_xac_nhan', da_xac_nhan: 'dang_giao', dang_giao: 'da_giao' };
// Xác nhận đơn -> Đang giao -> Đã giao (lần lượt từng bước)
r.patch('/orders/:id/status', asyncHandler(async (req, res) => {
  const { status } = parse(z.object({ status: z.enum(['da_xac_nhan', 'dang_giao', 'da_giao']) }), req.body);
  const o = await shopOrder(req);
  if (NEXT[o.status] !== status) throw new AppError(`Không thể chuyển từ "${o.status}" sang "${status}"`, 400);
  if (await AfterSales.exists({ order: o._id, status: 'cho_xu_ly' })) throw new AppError('Đơn đang có yêu cầu của khách chưa xử lý, hãy xử lý yêu cầu trước', 409);
  if (status === 'da_giao') return res.json(await orderSvc.markDelivered(o, req.user._id));
  o.status = status;
  o.statusHistory.push({ status, by: req.user._id, at: new Date() });
  await o.save();
  res.json(o);
}));

// Từ chối đơn (chỉ khi còn chờ xác nhận)
r.post('/orders/:id/reject', asyncHandler(async (req, res) => {
  const { reason } = parse(z.object({ reason: z.string().min(3).max(300) }), req.body);
  const o = await shopOrder(req);
  if (o.status !== 'cho_xac_nhan') throw new AppError('Chỉ từ chối được đơn đang chờ xác nhận', 400);
  res.json(await orderSvc.cancelOrder(o, req.user._id, `Gian hàng từ chối: ${reason}`));
}));

// ======================= Hủy / Đổi trả / Hoàn tiền =======================
r.get('/after-sales', asyncHandler(async (req, res) => {
  const f = { shop: req.shop._id };
  if (req.query.status) f.status = req.query.status;
  res.json(await AfterSales.find(f).sort({ createdAt: -1 }).populate('order', 'code total status payment').populate('customer', 'fullName phone').lean());
}));

r.patch('/after-sales/:id', asyncHandler(async (req, res) => {
  const d = parse(z.object({ decision: z.enum(['accept', 'reject']), note: z.string().min(3, 'Vui lòng nhập ghi chú').max(500) }), req.body);
  const a = await AfterSales.findOne({ _id: req.params.id, shop: req.shop._id });
  if (!a) throw new AppError('Không tìm thấy yêu cầu', 404);
  if (a.status !== 'cho_xu_ly') throw new AppError('Yêu cầu này đã được xử lý', 400);
  const o = await Order.findById(a.order);
  if (d.decision === 'accept') {
    if (a.type === 'huy_don') {
      if (o.status !== 'da_xac_nhan') throw new AppError('Đơn đã chuyển trạng thái, không thể hủy', 400);
      await orderSvc.cancelOrder(o, req.user._id, `Khách yêu cầu hủy: ${a.reason}`);
    } else if (a.type === 'hoan_tien') {
      if (!['da_giao', 'hoan_tat'].includes(o.status)) throw new AppError('Đơn không ở trạng thái có thể hoàn tiền', 400);
      await orderSvc.refundOrder(o, req.user._id, a.reason);
    } // doi_hang: gian hàng tự gửi hàng đổi, hệ thống chỉ ghi nhận
  }
  a.status = d.decision === 'accept' ? 'da_chap_nhan' : 'bi_tu_choi';
  a.sellerNote = d.note;
  a.handledBy = req.user._id;
  a.handledAt = new Date();
  await a.save();
  res.json(a);
}));

// ======================= Voucher của gian hàng (chỉ dùng cho gian hàng này) =======================
const voucherBase = z.object({
  code: z.string().min(3).max(30).regex(/^[A-Za-z0-9_-]+$/, 'Mã chỉ gồm chữ, số, gạch'),
  title: z.string().min(3).max(120),
  amount: z.number().int().min(1000),
  minOrder: z.number().int().min(0).default(0),
  quantity: z.number().int().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});
const voucherIn = voucherBase.refine((v) => v.endDate > v.startDate, { message: 'Ngày kết thúc phải sau ngày bắt đầu', path: ['endDate'] });

r.get('/vouchers', asyncHandler(async (req, res) => {
  res.json(await Voucher.find({ scope: 'shop', shop: req.shop._id, isDeleted: false }).sort({ createdAt: -1 }).lean());
}));
r.post('/vouchers', asyncHandler(async (req, res) => {
  const d = parse(voucherIn, req.body);
  if (await Voucher.exists({ code: d.code.toUpperCase() })) throw new AppError('Mã voucher đã tồn tại', 409);
  res.status(201).json(await Voucher.create({ ...d, scope: 'shop', shop: req.shop._id, remaining: d.quantity, pointsCost: 0 }));
}));
r.put('/vouchers/:id', asyncHandler(async (req, res) => {
  const v = await Voucher.findOne({ _id: req.params.id, scope: 'shop', shop: req.shop._id, isDeleted: false });
  if (!v) throw new AppError('Không tìm thấy voucher', 404);
  const d = parse(voucherBase.partial().extend({ active: z.boolean().optional() }), req.body);
  const claimed = v.quantity - v.remaining;
  if (d.quantity !== undefined) {
    if (d.quantity < claimed) throw new AppError(`Đã có ${claimed} lượt nhận, số lượng không được nhỏ hơn`, 400);
    v.remaining = d.quantity - claimed;
  }
  const { code, ...rest } = d; // không đổi mã
  Object.assign(v, rest);
  if (v.endDate <= v.startDate) throw new AppError('Ngày kết thúc phải sau ngày bắt đầu', 400);
  await v.save();
  res.json(v);
}));
r.delete('/vouchers/:id', asyncHandler(async (req, res) => {
  const v = await Voucher.findOne({ _id: req.params.id, scope: 'shop', shop: req.shop._id, isDeleted: false });
  if (!v) throw new AppError('Không tìm thấy voucher', 404);
  v.isDeleted = true;
  await v.save();
  res.json({ message: 'Đã xóa voucher' });
}));

// ======================= Đánh giá =======================
r.get('/reviews', asyncHandler(async (req, res) => {
  const pg = pageParams(req.query, 20);
  const f = { shop: req.shop._id, isDeleted: false };
  if (req.query.replied === 'false') f['reply.content'] = { $exists: false };
  const [items, total] = await Promise.all([
    Review.find(f).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit).populate('product', 'name images').populate('customer', 'fullName').lean(),
    Review.countDocuments(f),
  ]);
  res.json(paged(items, total, pg));
}));
r.post('/reviews/:id/reply', asyncHandler(async (req, res) => {
  const { content } = parse(z.object({ content: z.string().min(2).max(1000) }), req.body);
  const rv = await Review.findOne({ _id: req.params.id, shop: req.shop._id, isDeleted: false });
  if (!rv) throw new AppError('Không tìm thấy đánh giá', 404);
  rv.reply = { content, by: req.user._id, at: new Date() };
  await rv.save();
  res.json(rv);
}));

// ======================= Thống kê doanh thu (chỉ chủ gian hàng) =======================
r.get('/stats', requireOwner, asyncHandler(async (req, res) => {
  const range = parseRange(req.query);
  const orders = await Order.find({ shop: req.shop._id, $or: [{ createdAt: { $gte: range.from, $lte: range.to } }, { completedAt: { $gte: range.from, $lte: range.to } }] }).lean();
  res.json({
    ...summarize(orders, range, (o) => o.sellerRevenue),
    productCount: await Product.countDocuments({ shop: req.shop._id, isDeleted: false }),
  });
}));

export default r;
