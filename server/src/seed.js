// Tạo dữ liệu khởi tạo.  npm run seed        -> admin + danh mục + thương hiệu
//                         npm run seed:demo   -> thêm CSKH, gian hàng mẫu, sản phẩm, khách hàng, voucher
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import User from './models/User.js';
import Shop, { shopKey } from './models/Shop.js';
import { Category, Brand } from './models/Catalog.js';
import { Product, Variant } from './models/Product.js';
import { Voucher } from './models/Voucher.js';

const demo = process.argv.includes('--demo');
const hash = (p) => bcrypt.hash(p, 10);

async function ensureUser(email, data, password) {
  let u = await User.findOne({ email });
  if (!u) u = await User.create({ email, passwordHash: await hash(password), ...data });
  return u;
}
async function ensureCategory(name, parent = null) {
  return (await Category.findOne({ name, parent, isDeleted: false })) || Category.create({ name, parent });
}

await connectDB();

await ensureUser('admin@shop.local', { fullName: 'Quản trị viên', phone: '0900000000', role: 'admin' }, 'Admin@123');

const cats = {};
for (const n of ['Điện thoại', 'Laptop', 'Máy tính bàn', 'Linh kiện PC', 'Phụ kiện']) cats[n] = await ensureCategory(n);
for (const n of ['Card đồ họa (VGA)', 'CPU', 'RAM', 'Ổ cứng SSD', 'Bo mạch chủ']) cats[n] = await ensureCategory(n, cats['Linh kiện PC']._id);
for (const n of ['Apple', 'Samsung', 'ASUS', 'Dell', 'Lenovo', 'MSI', 'NVIDIA', 'AMD', 'Intel', 'Kingston', 'Logitech']) {
  if (!(await Brand.exists({ name: n, isDeleted: false }))) await Brand.create({ name: n });
}
console.log('[seed] admin@shop.local / Admin@123  + danh mục + thương hiệu');

if (demo) {
  await ensureUser('cskh@shop.local', { fullName: 'Nhân viên CSKH', phone: '0900000001', role: 'cskh' }, 'Cskh@123');
  const owner = await ensureUser('owner@shop.local', { fullName: 'Chủ Gian Hàng Demo', phone: '0900000002', role: 'seller', sellerRole: 'owner' }, 'Owner@123');
  let shop = await Shop.findOne({ owner: owner._id });
  if (!shop) {
    shop = await Shop.create({ name: 'TechZone Demo', nameKey: shopKey('TechZone Demo'), owner: owner._id, status: 'active', description: 'Gian hàng mẫu chuyên thiết bị điện tử', policy: 'Đổi trả trong 7 ngày nếu lỗi nhà sản xuất' });
    owner.shop = shop._id;
    await owner.save();
  }
  await ensureUser('khach@shop.local', { fullName: 'Nguyễn Văn Khách', phone: '0900000003', role: 'customer' }, 'Khach@123');

  const brand = async (n) => (await Brand.findOne({ name: n }))._id;
  const samples = [
    { name: 'iPhone 15 128GB', category: cats['Điện thoại']._id, brand: await brand('Apple'), variants: [['Đen / 128GB', 19990000, 20], ['Xanh / 128GB', 19990000, 15], ['Đen / 256GB', 22990000, 10]] },
    { name: 'Galaxy S24 Ultra 256GB', category: cats['Điện thoại']._id, brand: await brand('Samsung'), variants: [['Xám titan / 256GB', 27990000, 12]] },
    { name: 'Laptop ASUS TUF Gaming F15', category: cats['Laptop']._id, brand: await brand('ASUS'), variants: [['i5 / 16GB / 512GB', 21990000, 8], ['i7 / 16GB / 1TB', 26990000, 5]] },
    { name: 'Card đồ họa MSI RTX 4060 Ventus 2X 8GB', category: cats['Card đồ họa (VGA)']._id, brand: await brand('MSI'), variants: [['8GB GDDR6', 8490000, 25]] },
    { name: 'RAM Kingston Fury Beast 16GB DDR5', category: cats['RAM']._id, brand: await brand('Kingston'), variants: [['16GB 5200MHz', 1590000, 60], ['32GB (2x16GB) 5600MHz', 3190000, 30]] },
    { name: 'Chuột Logitech G102', category: cats['Phụ kiện']._id, brand: await brand('Logitech'), variants: [['Đen', 390000, 100]] },
  ];
  for (const s of samples) {
    if (await Product.exists({ shop: shop._id, name: s.name })) continue;
    const p = await Product.create({ shop: shop._id, name: s.name, category: s.category, brand: s.brand, description: `${s.name} - hàng chính hãng`, minPrice: Math.min(...s.variants.map((v) => v[1])) });
    await Variant.insertMany(s.variants.map(([name, price, stock]) => ({ product: p._id, name, price, stock })));
  }
  const now = new Date();
  const later = new Date(now.getTime() + 90 * 86400000);
  const vouchers = [
    { code: 'SAN100K', title: 'Giảm 100.000đ toàn sàn', scope: 'platform', amount: 100000, minOrder: 1000000, quantity: 1000, pointsCost: 0 },
    { code: 'DOIDIEM50K', title: 'Đổi điểm: giảm 50.000đ', scope: 'platform', amount: 50000, minOrder: 500000, quantity: 1000, pointsCost: 20 },
    { code: 'TECHZONE200K', title: 'TechZone giảm 200.000đ', scope: 'shop', shop: shop._id, amount: 200000, minOrder: 5000000, quantity: 100, pointsCost: 0 },
  ];
  for (const v of vouchers) if (!(await Voucher.exists({ code: v.code }))) await Voucher.create({ ...v, remaining: v.quantity, startDate: now, endDate: later });
  console.log('[seed:demo] cskh@shop.local/Cskh@123 | owner@shop.local/Owner@123 | khach@shop.local/Khach@123');
}

await mongoose.disconnect();
