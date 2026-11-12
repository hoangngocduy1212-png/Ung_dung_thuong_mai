import { Review } from '../models/Support.js';
import { Product } from '../models/Product.js';
import Shop from '../models/Shop.js';

const avg = (rs) => (rs.length ? Math.round((rs.reduce((s, r) => s + r.rating, 0) / rs.length) * 10) / 10 : 0);

export async function recalcRatings(productId, shopId) {
  const pr = await Review.find({ product: productId, isDeleted: false }).select('rating').lean();
  await Product.updateOne({ _id: productId }, { ratingAvg: avg(pr), ratingCount: pr.length });
  const sr = await Review.find({ shop: shopId, isDeleted: false }).select('rating').lean();
  await Shop.updateOne({ _id: shopId }, { ratingAvg: avg(sr), ratingCount: sr.length });
}
