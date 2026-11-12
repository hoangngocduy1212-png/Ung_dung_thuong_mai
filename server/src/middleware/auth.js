import jwt from 'jsonwebtoken';
import config from '../config.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/helpers.js';
import User from '../models/User.js';
import Shop from '../models/Shop.js';

export const signToken = (user) => jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: config.jwtExpires });

async function loadUser(req) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return null;
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    throw new AppError('Phiên đăng nhập không hợp lệ hoặc đã hết hạn', 401);
  }
  // Luôn đọc lại từ DB để việc khóa tài khoản có hiệu lực ngay
  const user = await User.findById(payload.id);
  if (!user || user.isDeleted) throw new AppError('Tài khoản không tồn tại', 401);
  if (user.status === 'locked') throw new AppError('Tài khoản đã bị khóa', 403);
  if (user.status === 'pending') throw new AppError('Tài khoản đang chờ chủ gian hàng duyệt', 403);
  if (user.status === 'rejected') throw new AppError('Tài khoản đã bị từ chối', 403);
  return user;
}

export const auth = asyncHandler(async (req, _res, next) => {
  const user = await loadUser(req);
  if (!user) throw new AppError('Bạn cần đăng nhập', 401);
  req.user = user;
  next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  req.user = (await loadUser(req)) || undefined;
  next();
});

export const requireRole = (...roles) => (req, _res, next) =>
  roles.includes(req.user.role) ? next() : next(new AppError('Bạn không có quyền thực hiện thao tác này', 403));

export const requireOwner = (req, _res, next) =>
  req.user.role === 'seller' && req.user.sellerRole === 'owner'
    ? next()
    : next(new AppError('Chỉ chủ gian hàng mới có quyền thực hiện thao tác này', 403));

// Seller chỉ thao tác kinh doanh được khi gian hàng đã được admin duyệt và không bị khóa
export const requireActiveShop = asyncHandler(async (req, _res, next) => {
  const shop = await Shop.findById(req.user.shop);
  if (!shop) throw new AppError('Không tìm thấy gian hàng', 404);
  if (shop.status !== 'active') {
    const msg = { pending: 'Gian hàng đang chờ quản trị viên duyệt', locked: 'Gian hàng đã bị khóa', rejected: 'Đăng ký gian hàng đã bị từ chối' }[shop.status];
    throw new AppError(msg, 403);
  }
  req.shop = shop;
  next();
});
