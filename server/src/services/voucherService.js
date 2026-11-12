import { Voucher, UserVoucher, PointTx } from '../models/Voucher.js';
import User from '../models/User.js';
import Shop from '../models/Shop.js';
import AppError from '../utils/AppError.js';

const liveFilter = (now = new Date()) => ({
  isDeleted: false,
  active: true,
  startDate: { $lte: now },
  endDate: { $gt: now },
});

// Danh sách voucher khách có thể nhận/đổi (voucher toàn sàn + voucher của 1 gian hàng nếu truyền shopId)
export async function listAvailable(userId, { shopId } = {}) {
  const or = [{ scope: 'platform' }];
  if (shopId) or.push({ scope: 'shop', shop: shopId });
  const vouchers = await Voucher.find({ ...liveFilter(), remaining: { $gt: 0 }, $or: or }).sort({ amount: -1 }).lean();
  const claimed = await UserVoucher.find({ user: userId, source: 'claim', voucher: { $in: vouchers.map((v) => v._id) } }).select('voucher').lean();
  const claimedSet = new Set(claimed.map((c) => String(c.voucher)));
  return vouchers.map((v) => ({ ...v, alreadyClaimed: v.pointsCost === 0 && claimedSet.has(String(v._id)) }));
}

// Nhận voucher miễn phí: mỗi khách nhận 1 lần / voucher
export async function claim(user, voucherId) {
  const v = await Voucher.findOne({ _id: voucherId, ...liveFilter() });
  if (!v) throw new AppError('Voucher không tồn tại hoặc đã hết hạn', 404);
  if (v.pointsCost > 0) throw new AppError('Voucher này cần đổi bằng điểm', 400);
  if (v.scope === 'shop') {
    const shop = await Shop.findById(v.shop).select('status');
    if (!shop || shop.status !== 'active') throw new AppError('Gian hàng của voucher không còn hoạt động', 400);
  }
  if (await UserVoucher.exists({ user: user._id, voucher: v._id, source: 'claim' })) throw new AppError('Bạn đã nhận voucher này rồi', 409);
  const dec = await Voucher.updateOne({ _id: v._id, remaining: { $gt: 0 } }, { $inc: { remaining: -1 } });
  if (!dec.modifiedCount) throw new AppError('Voucher đã hết lượt nhận', 409);
  return UserVoucher.create({ user: user._id, voucher: v._id, source: 'claim' });
}

// Đổi điểm lấy voucher toàn sàn: được đổi nhiều lần, mỗi bản dùng 1 lần
export async function redeemWithPoints(user, voucherId) {
  const v = await Voucher.findOne({ _id: voucherId, ...liveFilter() });
  if (!v) throw new AppError('Voucher không tồn tại hoặc đã hết hạn', 404);
  if (v.scope !== 'platform' || v.pointsCost <= 0) throw new AppError('Voucher này không đổi bằng điểm', 400);
  const dec = await Voucher.updateOne({ _id: v._id, remaining: { $gt: 0 } }, { $inc: { remaining: -1 } });
  if (!dec.modifiedCount) throw new AppError('Voucher đã hết lượt đổi', 409);
  const paid = await User.updateOne({ _id: user._id, points: { $gte: v.pointsCost } }, { $inc: { points: -v.pointsCost } });
  if (!paid.modifiedCount) {
    await Voucher.updateOne({ _id: v._id }, { $inc: { remaining: 1 } }); // hoàn lại lượt
    throw new AppError('Bạn không đủ điểm để đổi voucher này', 400);
  }
  const uv = await UserVoucher.create({ user: user._id, voucher: v._id, source: 'points' });
  await PointTx.create({ user: user._id, delta: -v.pointsCost, type: 'redeem', voucher: v._id, note: `Đổi voucher ${v.code}` });
  return uv;
}
