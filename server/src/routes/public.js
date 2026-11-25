import { Router } from 'express';
import mongoose from 'mongoose';
import { asyncHandler, escapeRegex, pageParams, paged } from '../utils/helpers.js';
import AppError from '../utils/AppError.js';
import Shop from '../models/Shop.js';
import { Category, Brand } from '../models/Catalog.js';
import { Product, Variant } from '../models/Product.js';
import { Review } from '../models/Support.js';
import { Voucher } from '../models/Voucher.js';

const r = Router();

// ---- Danh mục / thương hiệu ----
r.get('/categories', asyncHandler(async (_req, res) => {
  res.json(await Category.find({ isDeleted: false }).sort({ name: 1 }).lean());
}));
r.get('/brands', asyncHandler(async (_req, res) => {
  res.json(await Brand.find({ isDeleted: false }).sort({ name: 1 }).lean());
}));

// ---- Danh sách + tìm kiếm + lọc + sắp xếp sản phẩm ----
const SORTS = {
  newest: { createdAt: -1, _id: -1 },
  price_asc: { minPrice: 1, _id: -1 },
  price_desc: { minPrice: -1, _id: -1 },
  popular: { soldCount: -1, _id: -1 },
  rating: { ratingAvg: -1, ratingCount: -1, _id: -1 },
};

r.get('/products', asyncHandler(async (req, res) => {
  const { q, category, brand, shop, minPrice, maxPrice, sort = 'newest' } = req.query;
  const pg = pageParams(req.query, 12);

  // Chỉ hiện sản phẩm của gian hàng đang hoạt động
  const activeShops = (await Shop.find({ status: 'active' }).select('_id').lean()).map((s) => s._id);
  const filter = { isDeleted: false, hidden: false, shop: { $in: activeShops } };
  if (shop) filter.shop = { $in: activeShops.filter((id) => String(id) === String(shop)) };
  if (q) filter.name = { $regex: escapeRegex(q), $options: 'i' };
  if (category) {
    let targetId = category;
    if (!mongoose.Types.ObjectId.isValid(category)) {
      // Hỗ trợ ánh xạ slug hoặc tên danh mục (không phân biệt hoa/thường, không dấu)
      const allCats = await Category.find({ isDeleted: false }).lean();
      const normalize = (s) => (s || '').toLowerCase().replace(/đ/g, 'd').replace(/Đ/g, 'd').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
      const normTarget = normalize(category);
      const aliasMap = {
        phone: 'dienthoai',
        laptop: 'laptop',
        tablet: 'maytinhbang',
        audio: 'amthanh',
        wearable: 'thietbideo',
        accessories: 'phukien',
        pc: 'linhkienpc',
        desktop: 'maytinhban',
      };
      const mappedTarget = aliasMap[normTarget] || normTarget;

      const found = allCats.find((c) => {
        const n = normalize(c.name);
        return n === normTarget || n === mappedTarget || n.includes(normTarget) || normTarget.includes(n);
      });
      if (found) targetId = found._id;
    }

    if (mongoose.Types.ObjectId.isValid(targetId)) {
      const children = await Category.find({ parent: targetId, isDeleted: false }).select('_id').lean(); // gồm cả danh mục con
      filter.category = { $in: [targetId, ...children.map((c) => c._id)] };
    } else {
      // Không tìm thấy danh mục hợp lệ: lọc rỗng an toàn, tránh CastError
      filter.category = new mongoose.Types.ObjectId();
    }
  }
  if (brand) filter.brand = brand;
  if (minPrice || maxPrice) {
    filter.minPrice = {};
    if (minPrice) filter.minPrice.$gte = Number(minPrice);
    if (maxPrice) filter.minPrice.$lte = Number(maxPrice);
  }

  const [items, total] = await Promise.all([
    Product.find(filter).sort(SORTS[sort] || SORTS.newest).skip(pg.skip).limit(pg.limit)
      .populate('shop', 'name logo').populate('brand', 'name').populate('category', 'name').lean(),
    Product.countDocuments(filter),
  ]);
  // Tổng tồn kho + số biến thể (để hiển thị trên thẻ sản phẩm, không cần gọi chi tiết từng sản phẩm)
  const agg = await Variant.aggregate([
    { $match: { product: { $in: items.map((p) => p._id) }, isDeleted: false } },
    { $group: { _id: '$product', totalStock: { $sum: '$stock' }, variantCount: { $sum: 1 } } },
  ]);
  const aggMap = new Map(agg.map((a) => [String(a._id), a]));
  for (const p of items) {
    const a = aggMap.get(String(p._id));
    p.totalStock = a?.totalStock ?? 0;
    p.variantCount = a?.variantCount ?? 0;
  }
  res.json(paged(items, total, pg));
}));

// ---- Voucher toàn sàn đang phát hành (công khai, chỉ đọc) ----
r.get('/vouchers/platform', asyncHandler(async (_req, res) => {
  const now = new Date();
  res.json(await Voucher.find({ scope: 'platform', isDeleted: false, active: true, startDate: { $lte: now }, endDate: { $gt: now } })
    .select('code title amount minOrder remaining startDate endDate pointsCost').sort({ pointsCost: 1, amount: -1 }).lean());
}));

r.get('/products/:id', asyncHandler(async (req, res) => {
  const p = await Product.findOne({ _id: req.params.id, isDeleted: false, hidden: false })
    .populate('shop', 'name logo description policy status ratingAvg ratingCount').populate('brand', 'name').populate('category', 'name').lean();
  if (!p || p.shop.status !== 'active') throw new AppError('Sản phẩm không tồn tại hoặc đã ngừng bán', 404);
  p.variants = await Variant.find({ product: p._id, isDeleted: false }).select('name sku price stock').lean();
  res.json(p);
}));

r.get('/products/:id/reviews', asyncHandler(async (req, res) => {
  const pg = pageParams(req.query, 10);
  const filter = { product: req.params.id, isDeleted: false };
  const [reviews, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit).populate('customer', 'fullName').lean(),
    Review.countDocuments(filter),
  ]);
  // Che bớt tên người đánh giá
  const items = reviews.map((v) => ({ ...v, customer: { fullName: maskName(v.customer?.fullName) } }));
  res.json(paged(items, total, pg));
}));

function maskName(n = 'Khách hàng') {
  const parts = n.trim().split(/\s+/);
  const last = parts[parts.length - 1];
  return last.length <= 1 ? `${last}***` : `${last[0]}***${last.slice(-1)}`;
}

// ---- Thông tin gian hàng ----
r.get('/shops/:id', asyncHandler(async (req, res) => {
  const s = await Shop.findOne({ _id: req.params.id, status: 'active' }).select('name logo description policy ratingAvg ratingCount createdAt').lean();
  if (!s) throw new AppError('Gian hàng không tồn tại', 404);
  s.productCount = await Product.countDocuments({ shop: s._id, isDeleted: false, hidden: false });
  res.json(s);
}));

export default r;
