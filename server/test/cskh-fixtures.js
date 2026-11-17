import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import Shop from '../src/models/Shop.js';
import { Category } from '../src/models/Catalog.js';
import { Product } from '../src/models/Product.js';
import Order from '../src/models/Order.js';
import { Complaint, Review } from '../src/models/Support.js';

// Chỉ được gọi từ test/preview dùng MongoDB tạm, không seed database thật.
export async function createCskhFixtures() {
  if (!['cskh_test', 'cskh_preview'].includes(mongoose.connection.name)) throw new Error('Chỉ tạo dữ liệu CSKH demo trên database kiểm thử tạm.');
  const passwordHash = await bcrypt.hash('Demo@123', 10);
  const people = await User.create([
    ['cskh', 'cskh', 'Nguyễn Minh Anh', '0901000001'],
    ['cskh2', 'cskh', 'Trần Hoàng Nam', '0901000002'],
    ['admin', 'admin', 'Quản trị viên', '0901000003'],
    ['khach', 'customer', 'Lê Thu Hà', '0901000004'],
    ['khach2', 'customer', 'Phạm Đức Long', '0901000005'],
    ['seller', 'seller', 'Chủ gian hàng', '0901000006'],
  ].map(([name, role, fullName, phone]) => ({ email: `${name}@demo.local`, role, fullName, phone, passwordHash })));
  const [staff, otherStaff, admin, customer, otherCustomer, seller] = people;
  customer.addresses.push({ receiver: customer.fullName, phone: customer.phone, detail: '12 Nguyễn Huệ', ward: 'Bến Nghé', district: 'Quận 1', province: 'TP. Hồ Chí Minh', isDefault: true });
  await customer.save();
  const shop = await Shop.create({ name: 'TechZone Official', nameKey: 'techzone official', owner: seller._id, status: 'active' });
  const category = await Category.create({ name: 'Thiết bị điện tử' });
  const product = await Product.create({ name: 'Tai nghe Sony WH-1000XM5', shop: shop._id, category: category._id, ratingAvg: 3, ratingCount: 2, minPrice: 6490000 });
  const hiddenProduct = await Product.create({ name: 'Loa Bluetooth [bản cũ]', shop: shop._id, category: category._id, hidden: true, isDeleted: true });
  const orders = await Order.create([customer, otherCustomer].map((person, i) => ({
    code: `DH_DEMO_000${i + 1}`, groupCode: `NHOM_DEMO_${i + 1}`, customer: person._id, shop: shop._id,
    subtotal: 6490000, shippingFee: 30000, discount: 0, total: 6520000, sellerRevenue: 6490000, status: 'hoan_tat',
    items: [{ product: product._id, productName: product.name, variantName: 'Đen', price: 6490000, quantity: 1 }],
    payment: { method: 'cod', status: 'paid', paidAt: new Date() },
    shippingAddress: { receiver: person.fullName, phone: person.phone, detail: '12 Nguyễn Huệ', province: 'TP. Hồ Chí Minh' },
    statusHistory: [{ status: 'cho_xac_nhan' }, { status: 'da_giao' }, { status: 'hoan_tat', note: 'Khách hàng đã xác nhận nhận hàng' }],
  })));
  const makeComplaint = (code, fields = {}) => Complaint.create({
    code, customer: customer._id, contactName: customer.fullName, contactPhone: customer.phone,
    contactEmail: customer.email, order: orders[0]._id, orderCode: orders[0].code,
    reason: 'Tai nghe thiếu cáp sạc trong hộp. Nhờ kiểm tra và hỗ trợ gửi bù phụ kiện.', ...fields,
  });
  const pool = [];
  for (let i = 1; i <= 13; i++) pool.push(await makeComplaint(`KN_DEMO_${String(i).padStart(3, '0')}`));
  const mine = await makeComplaint('KN_DANG_XU_LY', { status: 'dang_xu_ly', assignedTo: staff._id, responses: [{ by: staff._id, role: 'cskh', content: 'Chúng tôi đã liên hệ gian hàng để kiểm tra phụ kiện.' }] });
  const escalated = await makeComplaint('KN_CHUYEN_ADMIN', { status: 'chuyen_admin', assignedTo: staff._id, escalateNote: 'Cần quản trị viên quyết định phương án hỗ trợ.', escalatedAt: new Date() });
  const closed = await makeComplaint('KN_DA_HOAN_TAT', { status: 'da_xu_ly', assignedTo: staff._id, resolvedBy: staff._id, resolvedAt: new Date(), result: 'Gian hàng đã gửi bù cáp sạc cho khách hàng.', responses: [{ by: staff._id, role: 'cskh', content: 'Kết quả xử lý: Gian hàng đã gửi bù cáp sạc cho khách hàng.' }] });
  const other = await makeComplaint('KN_NHAN_VIEN_KHAC', { status: 'dang_xu_ly', assignedTo: otherStaff._id });
  const reviews = await Review.create([
    { order: orders[0]._id, product: product._id, shop: shop._id, customer: customer._id, rating: 4, content: 'Âm thanh tốt, đóng gói cẩn thận. Mong shop kiểm tra đủ phụ kiện trước khi gửi.', reply: { content: 'Cảm ơn bạn. Gian hàng đang kiểm tra phụ kiện và sẽ hỗ trợ sớm.', by: seller._id, at: new Date() } },
    { order: orders[1]._id, product: product._id, shop: shop._id, customer: otherCustomer._id, rating: 2, content: 'Giao hàng hơi chậm, cần cải thiện thời gian hỗ trợ.' },
    { order: orders[0]._id, product: hiddenProduct._id, shop: shop._id, customer: customer._id, rating: 3, content: 'Đánh giá sản phẩm đã ngừng bán vẫn cần được kiểm duyệt.' },
  ]);
  return { staff, otherStaff, admin, customer, otherCustomer, shop, product, hiddenProduct, orders, pool, mine, escalated, closed, other, reviews, makeComplaint, objectId: () => new mongoose.Types.ObjectId() };
}
