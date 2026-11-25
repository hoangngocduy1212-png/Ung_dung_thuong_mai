import { connectDB } from '../src/db.js';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import { Product, Variant } from '../src/models/Product.js';
import { Category, Brand } from '../src/models/Catalog.js';
import Shop from '../src/models/Shop.js';
import { Review } from '../src/models/Support.js';

await connectDB();

console.log('=== DATABASE VERIFICATION ===');
const totalProducts = await Product.countDocuments({ isDeleted: false });
const totalVariants = await Variant.countDocuments({ isDeleted: false });
const totalShops = await Shop.countDocuments({ status: 'active' });
const totalReviews = await Review.countDocuments({ isDeleted: false });
const totalBrands = await Brand.countDocuments({ isDeleted: false });

console.log(`Total Products in DB: ${totalProducts}`);
console.log(`Total Variants in DB: ${totalVariants}`);
console.log(`Total Active Shops in DB: ${totalShops}`);
console.log(`Total Brands in DB: ${totalBrands}`);
console.log(`Total Reviews in DB: ${totalReviews}`);

console.log('\n=== CATEGORY BREAKDOWN ===');
const rootCats = await Category.find({ parent: null, isDeleted: false }).lean();
for (const rc of rootCats) {
  const children = await Category.find({ parent: rc._id, isDeleted: false }).lean();
  const catIds = [rc._id, ...children.map(c => c._id)];
  const count = await Product.countDocuments({ category: { $in: catIds }, isDeleted: false });
  console.log(`Category: "${rc.name}" -> ${count} products ${children.length ? `(includes ${children.length} subcategories: ${children.map(c => c.name).join(', ')})` : ''}`);
}

console.log('\n=== SHOPS DISTRIBUTION ===');
const shops = await Shop.find({ status: 'active' }).lean();
for (const s of shops) {
  const pCount = await Product.countDocuments({ shop: s._id, isDeleted: false });
  console.log(`Shop: "${s.name}" -> ${pCount} products (Owner: ${s.owner}, Logo: ${s.logo ? 'Yes' : 'No'})`);
}

console.log('\n=== REVIEWS SAMPLE ===');
const reviews = await Review.find({ isDeleted: false }).populate('product', 'name').populate('customer', 'fullName').populate('shop', 'name').limit(5).lean();
for (const r of reviews) {
  console.log(`- Product: [${r.product?.name}] | Rating: ${r.rating}★ by ${r.customer?.fullName}`);
  console.log(`  Content: "${r.content}"`);
  console.log(`  Shop Reply: "${r.reply?.content || 'No reply'}"`);
}

await mongoose.disconnect();
