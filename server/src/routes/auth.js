import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import config from '../config.js';
import AppError from '../utils/AppError.js';
import { asyncHandler, parse, zEmail, zPhone, zPassword, zId } from '../utils/helpers.js';
import User from '../models/User.js';
import Shop, { shopKey } from '../models/Shop.js';
import { auth, signToken } from '../middleware/auth.js';

const r = Router();
const hash = (p) => bcrypt.hash(p, 10);

// Đăng ký khách hàng
r.post('/register', asyncHandler(async (req, res) => {
  const d = parse(z.object({ fullName: z.string().min(2).max(80), email: zEmail, phone: zPhone, password: zPassword }), req.body);
  if (await User.exists({ email: d.email })) throw new AppError('Email đã được đăng ký', 409);
  const user = await User.create({ ...d, passwordHash: await hash(d.password), role: 'customer' });
  res.status(201).json({ token: signToken(user), user });
}));

// Danh sách gian hàng đang hoạt động để nhân viên chọn khi đăng ký
r.get('/shops', asyncHandler(async (_req, res) => {
  res.json(await Shop.find({ status: 'active' }).select('name logo').sort({ name: 1 }).lean());
}));

// Đăng ký người bán: "Bạn là chủ doanh nghiệp hay nhân viên?"
//  - owner: tạo gian hàng mới (chờ admin duyệt). Mỗi gian hàng chỉ có 1 chủ -> trùng tên gian hàng là bị từ chối.
//  - staff: chọn gian hàng đã có, chờ chủ gian hàng duyệt.
r.post('/register-seller', asyncHandler(async (req, res) => {
  const base = { fullName: z.string().min(2).max(80), email: zEmail, phone: zPhone, password: zPassword };
  const d = parse(
    z.discriminatedUnion('sellerType', [
      z.object({ ...base, sellerType: z.literal('owner'), shopName: z.string().min(2).max(80), shopDescription: z.string().max(1000).optional() }),
      z.object({ ...base, sellerType: z.literal('staff'), shopId: zId }),
    ]),
    req.body
  );
  if (await User.exists({ email: d.email })) throw new AppError('Email đã được đăng ký', 409);

  if (d.sellerType === 'owner') {
    const key = shopKey(d.shopName);
    if (await Shop.exists({ nameKey: key, status: { $ne: 'rejected' } }))
      throw new AppError('Gian hàng này đã có chủ, không thể tạo thêm tài khoản chủ gian hàng cho gian hàng này', 409);
    // Gian hàng từng bị từ chối thì giải phóng tên để đăng ký lại
    await Shop.deleteOne({ nameKey: key, status: 'rejected' });
    const user = await User.create({ fullName: d.fullName, email: d.email, phone: d.phone, passwordHash: await hash(d.password), role: 'seller', sellerRole: 'owner', status: 'active' });
    try {
      const shop = await Shop.create({ name: d.shopName.trim(), nameKey: key, description: d.shopDescription || '', owner: user._id, status: 'pending' });
      user.shop = shop._id;
      await user.save();
    } catch (e) {
      await User.deleteOne({ _id: user._id });
      throw e;
    }
    return res.status(201).json({ message: 'Đăng ký thành công. Gian hàng đang chờ quản trị viên phê duyệt.', token: signToken(user), user });
  }

  const shop = await Shop.findOne({ _id: d.shopId, status: 'active' });
  if (!shop) throw new AppError('Gian hàng không tồn tại hoặc chưa hoạt động', 404);
  const user = await User.create({ fullName: d.fullName, email: d.email, phone: d.phone, passwordHash: await hash(d.password), role: 'seller', sellerRole: 'staff', shop: shop._id, status: 'pending' });
  res.status(201).json({ message: 'Đăng ký thành công. Vui lòng chờ chủ gian hàng phê duyệt tài khoản.', user });
}));

r.post('/login', asyncHandler(async (req, res) => {
  const d = parse(z.object({ email: zEmail, password: z.string().min(1) }), req.body);
  const user = await User.findOne({ email: d.email }).select('+passwordHash');
  if (!user || user.isDeleted || !(await bcrypt.compare(d.password, user.passwordHash))) throw new AppError('Email hoặc mật khẩu không đúng', 401);
  if (user.status === 'locked') throw new AppError('Tài khoản đã bị khóa', 403);
  if (user.status === 'pending') throw new AppError('Tài khoản đang chờ chủ gian hàng phê duyệt', 403);
  if (user.status === 'rejected') throw new AppError('Tài khoản đã bị từ chối', 403);
  let shop;
  if (user.shop) shop = await Shop.findById(user.shop).select('name status logo').lean();
  res.json({ token: signToken(user), user, shop });
}));

r.post('/logout', auth, (_req, res) => res.json({ message: 'Đã đăng xuất' })); // JWT: client xóa token

r.get('/me', auth, asyncHandler(async (req, res) => {
  const shop = req.user.shop ? await Shop.findById(req.user.shop).select('name status logo').lean() : undefined;
  res.json({ user: req.user, shop });
}));

r.put('/password', auth, asyncHandler(async (req, res) => {
  const d = parse(z.object({ oldPassword: z.string(), newPassword: zPassword }), req.body);
  const u = await User.findById(req.user._id).select('+passwordHash');
  if (!(await bcrypt.compare(d.oldPassword, u.passwordHash))) throw new AppError('Mật khẩu cũ không đúng', 400);
  u.passwordHash = await hash(d.newPassword);
  await u.save();
  res.json({ message: 'Đã đổi mật khẩu' });
}));

// Quên mật khẩu. Chưa có dịch vụ gửi email nên ở môi trường dev token được trả về trực tiếp.
r.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = parse(z.object({ email: zEmail }), req.body);
  const user = await User.findOne({ email, isDeleted: false });
  const out = { message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.' };
  if (user) {
    const token = crypto.randomBytes(24).toString('hex');
    user.resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    user.resetTokenExpires = new Date(Date.now() + 15 * 60000);
    await user.save();
    if (!config.isProd) out.devResetToken = token;
  }
  res.json(out);
}));

r.post('/reset-password', asyncHandler(async (req, res) => {
  const d = parse(z.object({ token: z.string().min(10), newPassword: zPassword }), req.body);
  const user = await User.findOne({ resetTokenHash: crypto.createHash('sha256').update(d.token).digest('hex'), resetTokenExpires: { $gt: new Date() } }).select('+resetTokenHash +resetTokenExpires');
  if (!user) throw new AppError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn', 400);
  user.passwordHash = await hash(d.newPassword);
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  res.json({ message: 'Đã đặt lại mật khẩu' });
}));

export default r;
