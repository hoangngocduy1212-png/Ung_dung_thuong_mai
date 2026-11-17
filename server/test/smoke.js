// Kiểm thử luồng nghiệp vụ end-to-end:  npm test
// Dùng CSDL riêng (ecom_test_<time>) rồi xóa đi. Cần MongoDB chạy ở MONGODB_URI (mặc định 127.0.0.1:27017).
process.env.NODE_ENV = 'test';
const base = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/x';
process.env.MONGODB_URI = base.replace(/\/[^/?]*(\?|$)/, `/ecom_test_${Date.now()}$1`);

const { default: mongoose } = await import('mongoose');
const { default: app } = await import('../src/app.js');
const { connectDB } = await import('../src/db.js');
const { default: User } = await import('../src/models/User.js');
const { default: Order } = await import('../src/models/Order.js');
const { Variant } = await import('../src/models/Product.js');
const { autoCompleteOrders } = await import('../src/services/orderService.js');
const bcrypt = (await import('bcryptjs')).default;

await connectDB();
const server = app.listen(0);
const url = `http://127.0.0.1:${server.address().port}/api`;

let pass = 0;
const fails = [];
const ok = (cond, msg) => { if (cond) pass++; else { fails.push(msg); console.log('  ✗ FAIL:', msg); } };
const section = (t) => console.log('\n▶', t);
async function call(method, path, body, token) {
  const res = await fetch(url + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  let data; try { data = await res.json(); } catch { data = {}; }
  return { s: res.status, d: data };
}
// MongoDB thật đảm bảo cập nhật 1 document là nguyên tử. Một số CSDL giả lập tương thích MongoDB (FerretDB) thì không,
// khi đó bài kiểm tra "tranh nhau món cuối" không có ý nghĩa nên được bỏ qua.
async function dbIsAtomic() {
  const C = mongoose.connection.collection('_probe');
  for (let i = 0; i < 15; i++) {
    const { insertedId: _id } = await C.insertOne({ stock: 1 });
    const r = await Promise.all([1, 2].map(() => C.updateOne({ _id, stock: { $gte: 1 } }, { $inc: { stock: -1 } })));
    if (r.every((x) => x.modifiedCount === 1)) return false;
  }
  return true;
}
const login = async (email, password) => (await call('POST', '/auth/login', { email, password })).d.token;

try {
  // ---------- Khởi tạo admin ----------
  await User.create({ email: 'admin@t.com', phone: '0900000000', fullName: 'Admin', role: 'admin', passwordHash: await bcrypt.hash('Admin@123', 10) });
  const A = await login('admin@t.com', 'Admin@123');
  ok(!!A, 'admin đăng nhập');

  section('Danh mục / thương hiệu (admin)');
  const cat = (await call('POST', '/admin/categories', { name: 'Điện thoại' }, A)).d;
  const cat2 = (await call('POST', '/admin/categories', { name: 'Linh kiện' }, A)).d;
  const sub = (await call('POST', '/admin/categories', { name: 'Card đồ họa', parent: cat2._id }, A)).d;
  const brand = (await call('POST', '/admin/brands', { name: 'Apple' }, A)).d;
  ok(cat._id && sub._id && brand._id, 'tạo danh mục, danh mục con, thương hiệu');

  section('Đăng ký & phân vai trò');
  const reg = await call('POST', '/auth/register', { fullName: 'Khách Một', email: 'c1@t.com', phone: '0911111111', password: 'Pass@123' });
  ok(reg.s === 201 && reg.d.user.role === 'customer', 'đăng ký khách hàng');
  ok((await call('POST', '/auth/register', { fullName: 'Khách Một', email: 'c1@t.com', phone: '0911111111', password: 'Pass@123' })).s === 409, 'trùng email bị từ chối');
  ok((await call('POST', '/auth/register', { fullName: 'X', email: 'bad', phone: '1', password: '1' })).s === 400, 'dữ liệu sai bị 400');

  const o1 = await call('POST', '/auth/register-seller', { sellerType: 'owner', fullName: 'Chủ A', email: 'ownerA@t.com', phone: '0922222222', password: 'Pass@123', shopName: 'Shop Alpha' });
  ok(o1.s === 201, 'chủ gian hàng đăng ký tạo gian hàng chờ duyệt');
  ok((await call('POST', '/auth/register-seller', { sellerType: 'owner', fullName: 'Chủ Khác', email: 'dup@t.com', phone: '0922222223', password: 'Pass@123', shopName: ' shop  ALPHA ' })).s === 409, 'gian hàng đã có chủ -> không tạo thêm chủ');
  const OA = o1.d.token;
  ok((await call('GET', '/seller/profile', null, OA)).d.email === 'ownera@t.com', 'seller xem được hồ sơ tài khoản của chính mình');
  ok((await call('GET', '/seller/profile')).s === 401, 'khách vãng lai không xem được hồ sơ seller');
  ok((await call('GET', '/seller/products', null, OA)).s === 403, 'gian hàng chưa duyệt chưa được kinh doanh');
  ok((await call('GET', '/seller/shop', null, OA)).d.status === 'pending', 'seller xem được trạng thái chờ duyệt');
  const shops = (await call('GET', '/admin/shops?status=pending', null, A)).d.items;
  ok(shops.length === 1, 'admin thấy yêu cầu đăng ký gian hàng');
  const shopA = shops[0];
  ok((await call('PATCH', `/admin/shops/${shopA._id}/approve`, null, A)).s === 200, 'admin duyệt gian hàng');

  const o2 = await call('POST', '/auth/register-seller', { sellerType: 'owner', fullName: 'Chủ B', email: 'ownerB@t.com', phone: '0933333333', password: 'Pass@123', shopName: 'Shop Beta' });
  const shopB = (await call('GET', '/admin/shops?status=pending', null, A)).d.items[0];
  await call('PATCH', `/admin/shops/${shopB._id}/approve`, null, A);
  const OB = o2.d.token;
  const ownerProfile = await call('GET', '/seller/profile', null, OB);
  ok(ownerProfile.s === 200 && ownerProfile.d.email === 'ownerb@t.com' && !ownerProfile.d.passwordHash, 'seller chỉ nhận hồ sơ an toàn của tài khoản theo token');
  const profileUpdate = await call('PUT', '/seller/profile', { fullName: 'Chủ B cập nhật', phone: '0933333344' }, OB);
  ok(profileUpdate.s === 200 && profileUpdate.d.fullName === 'Chủ B cập nhật' && profileUpdate.d.phone === '0933333344', 'seller cập nhật tên liên hệ và số điện thoại');
  ok((await call('PUT', '/seller/profile', { phone: '123' }, OB)).s === 400, 'seller không lưu số điện thoại sai định dạng');
  ok((await call('GET', '/seller/profile', null, reg.d.token)).s === 403, 'khách hàng không truy cập hồ sơ seller');

  const staffReg = await call('POST', '/auth/register-seller', { sellerType: 'staff', fullName: 'NV A', email: 'staffA@t.com', phone: '0944444444', password: 'Pass@123', shopId: shopA._id });
  ok(staffReg.s === 201, 'nhân viên đăng ký vào gian hàng');
  ok((await call('POST', '/auth/login', { email: 'staffA@t.com', password: 'Pass@123' })).s === 403, 'nhân viên chưa được duyệt không đăng nhập được');
  ok((await call('PATCH', `/seller/staff/${staffReg.d.user._id}/approve`, null, OB)).s === 404, 'chủ shop khác không duyệt được nhân viên shop này');
  ok((await call('PATCH', `/seller/staff/${staffReg.d.user._id}/approve`, null, OA)).s === 200, 'chủ gian hàng duyệt nhân viên');
  const SA = await login('staffA@t.com', 'Pass@123');
  ok(!!SA, 'nhân viên đăng nhập sau khi được duyệt');
  ok((await call('GET', '/seller/stats', null, SA)).s === 403, 'nhân viên không xem được thống kê doanh thu');
  ok((await call('PUT', '/seller/shop', { description: 'x' }, SA)).s === 403, 'nhân viên không sửa được thông tin gian hàng');
  ok((await call('GET', '/seller/products', null, SA)).s === 200, 'nhân viên quản lý được sản phẩm');

  section('Sản phẩm & biến thể (seller)');
  const pA = (await call('POST', '/seller/products', { name: 'iPhone Test 128GB', category: cat._id, brand: brand._id, images: ['/uploads/a.jpg'], variants: [{ name: 'Đen', price: 10000000, stock: 5 }, { name: 'Trắng', price: 11000000, stock: 3 }] }, OA)).d;
  ok(pA._id && pA.variants.length === 2 && pA.minPrice === 10000000, 'tạo sản phẩm 2 biến thể, minPrice đúng');
  const pB = (await call('POST', '/seller/products', { name: 'Card RTX Test', category: sub._id, variants: [{ name: '8GB', price: 2000000, stock: 10 }] }, OB)).d;
  const pLast = (await call('POST', '/seller/products', { name: 'Hàng chỉ còn 1', category: cat._id, variants: [{ name: 'Mặc định', price: 1500000, stock: 1 }] }, OA)).d;
  ok(!!pB._id && !!pLast._id, 'tạo thêm sản phẩm');
  ok((await call('POST', '/seller/products', { name: 'Thiếu biến thể', category: cat._id, variants: [] }, OA)).s === 400, 'sản phẩm phải có >= 1 biến thể');
  const vA0 = pA.variants[0], vA1 = pA.variants[1], vB0 = pB.variants[0], vLast = pLast.variants[0];
  ok((await call('PUT', `/seller/products/${pA._id}`, { name: 'Không được ghi dở', variants: [{ _id: vB0._id, name: 'Sai shop', price: 1000 }] }, OA)).s === 400, 'từ chối biến thể thuộc sản phẩm shop khác');
  ok((await call('GET', `/seller/products/${pA._id}`, null, OA)).d.name === 'iPhone Test 128GB', 'lỗi biến thể không ghi dở thông tin sản phẩm');

  const stockRes = await call('PATCH', `/seller/products/${pA._id}/variants/${vA0._id}/stock`, { delta: 5 }, OA);
  ok(stockRes.d.stock === 10, 'nhập thêm tồn kho (delta)');
  ok((await call('PATCH', `/seller/products/${pA._id}/variants/${vA0._id}/stock`, { delta: -100 }, OA)).s === 400, 'không trừ tồn kho âm');
  ok((await call('PATCH', `/seller/products/${pA._id}/variants/${vA0._id}/stock`, { stock: 5 }, OA)).d.stock === 5, 'đặt lại tồn kho');

  section('Khách vãng lai: xem / tìm / lọc');
  const list = (await call('GET', '/products')).d;
  ok(list.total === 3, 'danh sách sản phẩm công khai');
  ok((await call('GET', '/products?q=iphone')).d.total === 1, 'tìm kiếm theo tên');
  ok((await call('GET', `/products?category=${cat2._id}`)).d.total === 1, 'lọc theo danh mục cha gồm danh mục con');
  ok((await call('GET', '/products?minPrice=1800000&maxPrice=5000000')).d.total === 1, 'lọc theo giá');
  ok((await call('GET', '/products?sort=price_desc')).d.items[0].name.startsWith('iPhone'), 'sắp xếp giá giảm dần');
  const det = (await call('GET', `/products/${pA._id}`)).d;
  ok(det.variants.length === 2 && det.shop.name === 'Shop Alpha', 'chi tiết sản phẩm có biến thể + gian hàng');
  ok((await call('GET', '/customer/cart')).s === 401, 'vãng lai không dùng được giỏ hàng');

  section('Voucher');
  const now = Date.now();
  const dates = { startDate: new Date(now - 1000).toISOString(), endDate: new Date(now + 30 * 86400000).toISOString() };
  const vPlat = (await call('POST', '/admin/vouchers', { code: 'SAN100K', title: 'Giảm 100k', amount: 100000, minOrder: 1000000, quantity: 5, ...dates }, A)).d;
  const vPts = (await call('POST', '/admin/vouchers', { code: 'DOI50K', title: 'Đổi điểm 50k', amount: 50000, minOrder: 500000, quantity: 10, pointsCost: 100, ...dates }, A)).d;
  const vShopB = (await call('POST', '/seller/vouchers', { code: 'BETA200K', title: 'Beta giảm 200k', amount: 200000, minOrder: 1000000, quantity: 5, ...dates }, OB)).d;
  ok(vPlat._id && vPts._id && vShopB._id, 'tạo voucher toàn sàn, đổi điểm, voucher gian hàng');
  ok((await call('POST', '/seller/vouchers', { code: 'san100k', title: 'trùng mã', amount: 5000, quantity: 1, ...dates }, OA)).s === 409, 'trùng mã voucher bị từ chối');
  const C1 = reg.d.token;
  ok((await call('POST', `/customer/vouchers/${vPlat._id}/claim`, null, C1)).s === 201, 'khách nhận voucher toàn sàn');
  ok((await call('POST', `/customer/vouchers/${vPlat._id}/claim`, null, C1)).s === 409, 'không nhận lại voucher đã nhận');
  ok((await call('POST', `/customer/vouchers/${vShopB._id}/claim`, null, C1)).s === 201, 'khách nhận voucher gian hàng');
  ok((await call('POST', `/customer/vouchers/${vPts._id}/claim`, null, C1)).s === 400, 'voucher đổi điểm không nhận miễn phí');
  ok((await call('POST', `/customer/vouchers/${vPts._id}/redeem`, null, C1)).s === 400, 'không đủ điểm không đổi được');
  const myV = (await call('GET', '/customer/my-vouchers?status=unused', null, C1)).d;
  const uvPlat = myV.find((x) => x.voucher.code === 'SAN100K'), uvB = myV.find((x) => x.voucher.code === 'BETA200K');

  section('Giỏ hàng & đặt hàng (tách đơn theo gian hàng)');
  const addr = (await call('POST', '/customer/addresses', { receiver: 'Khách Một', phone: '0911111111', detail: '1 Nguyễn Huệ', province: 'TP.HCM' }, C1)).d[0];
  ok(addr.isDefault, 'địa chỉ đầu tiên là mặc định');
  ok((await call('POST', '/customer/cart/items', { productId: pA._id, variantId: vA0._id, quantity: 99 }, C1)).s === 409, 'không thêm vượt tồn kho');
  await call('POST', '/customer/cart/items', { productId: pA._id, variantId: vA0._id, quantity: 1 }, C1);
  const cartRes = await call('POST', '/customer/cart/items', { productId: pA._id, variantId: vA0._id, quantity: 1 }, C1);
  ok(cartRes.d.items.length === 1 && cartRes.d.items[0].quantity === 2, 'thêm trùng sản phẩm thì cộng dồn số lượng');
  await call('POST', '/customer/cart/items', { productId: pB._id, variantId: vB0._id, quantity: 1 }, C1);
  ok((await call('POST', `/customer/wishlist/${pB._id}`, null, C1)).s === 201, 'thêm yêu thích');
  ok((await call('GET', '/customer/wishlist', null, C1)).d.length === 1, 'xem yêu thích');
  await call('POST', `/customer/wishlist/${pA._id}`, null, C1);

  // voucher shop B không dùng được cho đơn shop A
  const bad = await call('POST', '/customer/orders/checkout', { addressId: addr._id, paymentMethod: 'cod', vouchers: { [shopA._id]: uvB._id } }, C1);
  ok(bad.s === 400, 'voucher của shop khác không áp dụng cho đơn này');
  ok((await Variant.findById(vA0._id)).stock === 5, 'đặt lỗi thì kho không bị trừ (hoàn tác đúng)');

  const co = await call('POST', '/customer/orders/checkout', { addressId: addr._id, paymentMethod: 'cod', note: 'giao giờ HC', vouchers: { [shopA._id]: uvPlat._id, [shopB._id]: uvB._id } }, C1);
  ok(co.s === 201 && co.d.orders.length === 2, 'giỏ 2 gian hàng -> tách thành 2 đơn');
  const listedOrders = (await call('GET', '/customer/orders?page=1&limit=10', null, C1)).d.items;
  ok(listedOrders.every((order) => Array.isArray(order.afterSales) && Array.isArray(order.reviewedProducts)), 'danh sách đơn gồm yêu cầu sau bán hàng và sản phẩm đã đánh giá');
  const ordA = co.d.orders.find((o) => o.shop === shopA._id), ordB = co.d.orders.find((o) => o.shop === shopB._id);
  ok(ordA.subtotal === 20000000 && ordA.discount === 100000 && ordA.total === 19930000 && ordA.sellerRevenue === 20000000, 'đơn A: voucher sàn do sàn chịu, shop nhận đủ tiền hàng');
  ok(ordB.subtotal === 2000000 && ordB.discount === 200000 && ordB.total === 1830000 && ordB.sellerRevenue === 1800000, 'đơn B: voucher shop do shop chịu');
  ok((await Variant.findById(vA0._id)).stock === 3 && (await Variant.findById(vB0._id)).stock === 9, 'trừ tồn kho khi đặt');
  ok((await call('GET', '/customer/cart', null, C1)).d.items.length === 0, 'đặt xong thì giỏ hàng được dọn');
  ok((await call('GET', '/customer/my-vouchers?status=unused', null, C1)).d.length === 0, 'voucher đã dùng không dùng lại được');

  section('Xử lý đơn (seller) -> hoàn tất -> điểm -> đánh giá');
  ok((await call('PATCH', `/seller/orders/${ordA._id}/status`, { status: 'dang_giao' }, OA)).s === 400, 'không nhảy cóc trạng thái');
  ok((await call('PATCH', `/seller/orders/${ordA._id}/status`, { status: 'da_xac_nhan' }, OB)).s === 404, 'shop khác không đụng được đơn');
  ok((await call('PATCH', `/seller/orders/${ordA._id}/status`, { status: 'da_xac_nhan' }, SA)).s === 200, 'nhân viên xác nhận đơn');
  ok((await call('PATCH', `/seller/orders/${ordA._id}/status`, { status: 'dang_giao' }, OA)).s === 200, 'đang giao');
  ok((await call('POST', `/customer/orders/${ordA._id}/cancel`, { reason: 'đổi ý' }, C1)).s === 400, 'đã xác nhận thì không tự hủy được');
  const dlv = (await call('PATCH', `/seller/orders/${ordA._id}/status`, { status: 'da_giao' }, OA)).d;
  ok(dlv.status === 'da_giao' && dlv.payment.status === 'paid', 'đã giao: COD ghi nhận đã thu tiền');
  ok((await call('POST', '/customer/reviews', { orderId: ordA._id, productId: pA._id, rating: 5 }, C1)).s === 400, 'chưa hoàn tất thì chưa đánh giá được');
  const comp = (await call('POST', `/customer/orders/${ordA._id}/confirm-received`, null, C1)).d;
  ok(comp.status === 'hoan_tat' && comp.pointsEarned === 1990, 'khách xác nhận nhận hàng -> hoàn tất, +1990 điểm');
  ok((await call('GET', '/customer/points', null, C1)).d.points === 1990, 'số điểm khách đúng');
  ok((await call('POST', '/customer/reviews', { orderId: ordA._id, productId: pA._id, rating: 4, content: 'Tốt' }, C1)).s === 201, 'đánh giá sau khi nhận hàng');
  const myReviews = await call('GET', '/customer/reviews', null, C1);
  ok(myReviews.s === 200 && myReviews.d.total === 1 && myReviews.d.items[0].rating === 4 && myReviews.d.items[0].product.name === 'iPhone Test 128GB', 'khách xem được nội dung đánh giá của chính mình');
  ok((await call('POST', '/customer/reviews', { orderId: ordA._id, productId: pA._id, rating: 4 }, C1)).s === 409, 'không đánh giá trùng');
  ok((await call('POST', '/customer/reviews', { orderId: ordA._id, productId: pB._id, rating: 4 }, C1)).s === 400, 'không đánh giá sản phẩm ngoài đơn');
  const rvs = (await call('GET', `/products/${pA._id}/reviews`)).d;
  ok(rvs.total === 1 && (await call('GET', `/products/${pA._id}`)).d.ratingAvg === 4, 'đánh giá hiển thị + tính điểm trung bình');
  ok(rvs.items[0].customer.fullName.includes('***'), 'tên người đánh giá được che bớt');
  const rid = (await call('GET', '/seller/reviews', null, OA)).d.items[0]._id;
  ok((await call('POST', `/seller/reviews/${rid}/reply`, { content: 'Cảm ơn bạn!' }, SA)).s === 200, 'seller phản hồi đánh giá');

  section('Đổi điểm lấy voucher');
  const r1 = await call('POST', `/customer/vouchers/${vPts._id}/redeem`, null, C1);
  const r2 = await call('POST', `/customer/vouchers/${vPts._id}/redeem`, null, C1);
  ok(r1.s === 201 && r2.s === 201 && r2.d.points === 1790, 'đổi nhiều voucher cùng loại, trừ 100 điểm/lần');
  ok((await call('GET', '/customer/my-vouchers?status=unused', null, C1)).d.length === 2, 'có 2 voucher đã đổi');

  section('Hủy đơn / hoàn tiền / đổi trả');
  // a) hủy khi chờ xác nhận -> hoàn kho + trả voucher
  await call('POST', '/customer/cart/items', { productId: pB._id, variantId: vB0._id, quantity: 2 }, C1);
  const uvR = (await call('GET', '/customer/my-vouchers?status=unused', null, C1)).d[0];
  const co2 = await call('POST', '/customer/orders/checkout', { addressId: addr._id, paymentMethod: 'cod', vouchers: { [shopB._id]: uvR._id } }, C1);
  ok(co2.s === 201 && (await Variant.findById(vB0._id)).stock === 7, 'đặt đơn mới dùng voucher đổi điểm cho đơn shop B');
  const o3 = co2.d.orders[0];
  const cc = await call('POST', `/customer/orders/${o3._id}/cancel`, { reason: 'Đặt nhầm' }, C1);
  ok(cc.s === 200 && cc.d.status === 'da_huy', 'khách hủy đơn chờ xác nhận');
  ok((await Variant.findById(vB0._id)).stock === 9, 'hủy đơn -> hoàn lại tồn kho');
  ok((await call('GET', '/customer/my-vouchers?status=unused', null, C1)).d.length === 2, 'hủy đơn -> trả lại voucher');
  // b) yêu cầu hủy khi đã xác nhận -> seller duyệt
  await call('POST', '/customer/cart/items', { productId: pB._id, variantId: vB0._id, quantity: 1 }, C1);
  const o4 = (await call('POST', '/customer/orders/checkout', { addressId: addr._id, paymentMethod: 'online' }, C1)).d;
  const pay = await call('POST', `/customer/orders/group/${o4.groupCode}/pay`, null, C1);
  ok(pay.d.orders[0].payment.status === 'paid', 'thanh toán online (giả lập)');
  await call('PATCH', `/seller/orders/${o4.orders[0]._id}/status`, { status: 'da_xac_nhan' }, OB);
  const as1 = await call('POST', `/customer/orders/${o4.orders[0]._id}/after-sales`, { type: 'huy_don', reason: 'Không cần nữa' }, C1);
  ok(as1.s === 201, 'gửi yêu cầu hủy đơn đã xác nhận');
  ok((await call('PATCH', `/seller/orders/${o4.orders[0]._id}/status`, { status: 'dang_giao' }, OB)).s === 409, 'có yêu cầu chờ xử lý thì chưa giao tiếp được');
  ok((await call('PATCH', `/seller/after-sales/${as1.d._id}`, { decision: 'accept', note: 'Đã hủy cho bạn' }, OB)).s === 200, 'seller chấp nhận hủy');
  const o4After = (await call('GET', `/customer/orders/${o4.orders[0]._id}`, null, C1)).d;
  ok(o4After.status === 'da_huy' && o4After.payment.status === 'refunded', 'đơn đã thanh toán bị hủy -> hoàn tiền');
  // c) hoàn tiền sau khi hoàn tất -> thu hồi điểm
  const as2 = await call('POST', `/customer/orders/${ordA._id}/after-sales`, { type: 'hoan_tien', reason: 'Máy lỗi màn hình' }, C1);
  ok(as2.s === 201, 'yêu cầu hoàn tiền đơn đã hoàn tất');
  const listedPending = (await call('GET', '/customer/orders?page=1&limit=10', null, C1)).d.items.find((order) => String(order._id) === String(ordA._id));
  ok(listedPending.afterSales.some((request) => request.status === 'cho_xu_ly' && request.type === 'hoan_tien'), 'danh sách đơn phản ánh yêu cầu hoàn tiền đang chờ');
  ok((await call('POST', `/customer/orders/${ordA._id}/after-sales`, { type: 'doi_hang', reason: 'Đổi sang màu khác' }, C1)).s === 409, 'không gửi 2 yêu cầu cùng lúc');
  ok((await call('PATCH', `/seller/after-sales/${as2.d._id}`, { decision: 'reject', note: 'x' }, OA)).s === 400, 'từ chối cần ghi chú đủ dài');
  ok((await call('PATCH', `/seller/after-sales/${as2.d._id}`, { decision: 'accept', note: 'Đồng ý hoàn tiền' }, OA)).s === 200, 'seller đồng ý hoàn tiền');
  const ordAfter = (await call('GET', `/customer/orders/${ordA._id}`, null, C1)).d;
  ok(ordAfter.status === 'da_tra_hang' && ordAfter.payment.status === 'refunded', 'đơn chuyển "đã trả hàng", tiền hoàn');
  ok((await call('GET', '/customer/points', null, C1)).d.points === 0, 'hoàn tiền -> thu hồi điểm (chỉ thu tối đa số điểm đang có, không âm)');

  section('Khiếu nại: khách -> CSKH -> admin');
  const csk = (await call('POST', '/admin/cskh', { fullName: 'CSKH 1', email: 'cs1@t.com', phone: '0955555555', password: 'Pass@123' }, A)).d;
  const CS = await login('cs1@t.com', 'Pass@123');
  ok(!!csk._id && !!CS, 'admin tạo tài khoản CSKH, CSKH đăng nhập');
  ok((await call('POST', '/customer/complaints', { contactName: 'Khách Một', contactPhone: '0911111111', orderCode: 'DH000000XXXX', reason: 'Giao hàng chậm quá lâu' }, C1)).s === 404, 'mã đơn không tồn tại');
  const k1 = (await call('POST', '/customer/complaints', { contactName: 'Khách Một', contactPhone: '0911111111', contactEmail: 'c1@t.com', orderCode: ordA.code, reason: 'Gian hàng từ chối hoàn tiền không lý do' }, C1)).d;
  ok(k1.status === 'moi', 'khách gửi đơn khiếu nại');
  ok((await call('GET', '/staff/complaints?scope=pool', null, CS)).d.total === 1, 'CSKH thấy đơn mới');
  ok((await call('POST', `/staff/complaints/${k1._id}/respond`, { content: 'Chúng tôi đang liên hệ gian hàng' }, CS)).d.status === 'dang_xu_ly', 'CSKH phản hồi (nhận xử lý)');
  ok((await call('POST', `/staff/complaints/${k1._id}/escalate`, { note: 'Cần quản trị viên quyết định' }, CS)).d.status === 'chuyen_admin', 'CSKH chuyển lên admin');
  ok((await call('GET', '/admin/complaints', null, A)).d.total === 1, 'admin thấy đơn được chuyển');
  ok((await call('POST', `/admin/complaints/${k1._id}/resolve`, { result: 'Hoàn tiền cho khách', forceRefund: true }, A)).s === 400, 'đơn đã hoàn tiền rồi -> không ép hoàn lần nữa');
  ok((await call('POST', `/admin/complaints/${k1._id}/resolve`, { result: 'Gian hàng đã hoàn tiền, đóng khiếu nại' }, A)).d.status === 'da_xu_ly', 'admin quyết định & đóng');
  const k1v = (await call('GET', `/customer/complaints/${k1._id}`, null, C1)).d;
  ok(k1v.status === 'da_xu_ly' && k1v.responses.length >= 2, 'khách xem được phản hồi + kết quả');
  const k2 = (await call('POST', '/customer/complaints', { contactName: 'Khách Một', contactPhone: '0911111111', orderCode: ordB.code, reason: 'Thiếu phụ kiện trong hộp hàng' }, C1)).d;
  await call('POST', `/staff/complaints/${k2._id}/resolve`, { result: 'Đã gửi bù phụ kiện' }, CS);
  ok((await call('GET', '/staff/complaints?scope=history', null, CS)).d.total === 2, 'CSKH xem lịch sử đơn đã xử lý (gồm đơn admin đã đóng sau khi chuyển lên)');
  const CS2 = await (async () => { await call('POST', '/admin/cskh', { fullName: 'CSKH 2', email: 'cs2@t.com', phone: '0966666666', password: 'Pass@123' }, A); return login('cs2@t.com', 'Pass@123'); })();
  const k3 = (await call('POST', '/customer/complaints', { contactName: 'Khách Một', contactPhone: '0911111111', orderCode: ordB.code, reason: 'Khiếu nại thứ ba để thử quyền' }, C1)).d;
  await call('POST', `/staff/complaints/${k3._id}/respond`, { content: 'Nhận xử lý' }, CS);
  ok((await call('POST', `/staff/complaints/${k3._id}/respond`, { content: 'chen ngang' }, CS2)).s === 403, 'đơn đã có CSKH phụ trách thì người khác không chen vào');

  section('CSKH: tra cứu & xóa đánh giá');
  ok((await call('GET', '/staff/customers?q=c1@t.com', null, CS)).d.total === 1, 'tìm khách hàng');
  ok((await call('GET', `/staff/orders?q=${ordB.code}`, null, CS)).d.total === 1, 'tìm đơn theo mã');
  const rl = (await call('GET', `/staff/reviews?product=${pA._id}`, null, CS)).d;
  ok(rl.total === 1, 'xem đánh giá theo sản phẩm');
  ok((await call('DELETE', `/staff/reviews/${rl.items[0]._id}`, null, CS)).s === 200, 'xóa đánh giá');
  ok((await call('GET', `/products/${pA._id}`)).d.ratingCount === 0, 'xóa đánh giá -> tính lại điểm sản phẩm');
  const removedReviewOrder = (await call('GET', `/customer/orders/${ordA._id}`, null, C1)).d;
  ok(removedReviewOrder.reviewedProducts.includes(String(pA._id)) && (await call('GET', '/customer/reviews?page=1&limit=100', null, C1)).d.total === 0, 'review đã gỡ ẩn khỏi tab đã đánh giá nhưng không mở lại lượt đánh giá');

  section('Chống bán quá số lượng (tranh nhau món cuối)');
  const C2 = (await call('POST', '/auth/register', { fullName: 'Khách Hai', email: 'c2@t.com', phone: '0912222222', password: 'Pass@123' })).d.token;
  const C3 = (await call('POST', '/auth/register', { fullName: 'Khách Ba', email: 'c3@t.com', phone: '0913333333', password: 'Pass@123' })).d.token;
  const ad = { receiver: 'Ai Đó', phone: '0912222222', detail: 'Địa chỉ' };
  await call('POST', '/customer/cart/items', { productId: pLast._id, variantId: vLast._id, quantity: 1 }, C2);
  await call('POST', '/customer/cart/items', { productId: pLast._id, variantId: vLast._id, quantity: 1 }, C3);
  if (await dbIsAtomic()) {
    const race = await Promise.all([C2, C3].map((t) => call('POST', '/customer/orders/checkout', { address: ad, paymentMethod: 'cod' }, t)));
    ok(race.filter((x) => x.s === 201).length === 1 && race.filter((x) => x.s === 409).length === 1, 'hai người cùng mua món cuối: chỉ 1 người đặt được');
    ok((await Variant.findById(vLast._id)).stock === 0, 'tồn kho không bị âm');
  } else {
    console.log('  ⚠ BỎ QUA: CSDL hiện tại không đảm bảo cập nhật nguyên tử (bản giả lập MongoDB). Hãy chạy lại trên MongoDB/Atlas thật.');
  }

  section('Tự động hoàn tất & thống kê');
  const oldOrder = await Order.findById(ordB._id);
  oldOrder.status = 'da_giao'; oldOrder.deliveredAt = new Date(Date.now() - 5 * 86400000); await oldOrder.save();
  ok((await autoCompleteOrders()) === 1, 'tự hoàn tất đơn đã giao quá hạn');
  const st = (await call('GET', '/seller/stats', null, OB)).d;
  ok(st.revenue === 1800000 && st.completedOrders === 1, 'thống kê doanh thu gian hàng B');
  const ast = (await call('GET', '/admin/stats', null, A)).d;
  ok(ast.gmv === 1830000 && ast.topShops[0].name === 'Shop Beta', 'thống kê toàn sàn (GMV)');

  section('Khóa / xóa mềm / phân quyền');
  ok((await call('GET', '/seller/shop', null, C1)).s === 403, 'khách không vào được khu vực seller');
  ok((await call('GET', '/admin/shops', null, OA)).s === 403, 'seller không vào được khu vực admin');
  ok((await call('GET', '/admin/shops')).s === 401, 'chưa đăng nhập -> 401');
  ok((await call('PATCH', `/admin/customers/${reg.d.user._id}/lock`, null, A)).s === 200, 'admin khóa khách hàng');
  ok((await call('GET', '/customer/cart', null, C1)).s === 403, 'tài khoản bị khóa dùng token cũ cũng bị chặn');
  ok((await call('POST', '/auth/login', { email: 'c1@t.com', password: 'Pass@123' })).s === 403, 'tài khoản bị khóa không đăng nhập được');
  await call('PATCH', `/admin/customers/${reg.d.user._id}/unlock`, null, A);
  ok((await call('GET', '/customer/cart', null, C1)).s === 200, 'mở khóa lại dùng được');
  ok((await call('PATCH', `/admin/shops/${shopB._id}/lock`, null, A)).s === 200, 'admin khóa gian hàng B');
  ok((await call('GET', '/products')).d.items.every((p) => p.shop.name !== 'Shop Beta'), 'sản phẩm gian hàng bị khóa biến mất khỏi sàn');
  ok((await call('GET', '/seller/products', null, OB)).s === 403, 'gian hàng bị khóa không kinh doanh được');
  await call('PATCH', `/admin/shops/${shopB._id}/unlock`, null, A);
  ok((await call('DELETE', `/seller/products/${pA._id}`, null, OA)).s === 200, 'seller xóa sản phẩm (xóa mềm)');
  const savedWishlist = (await call('GET', '/customer/wishlist', null, C1)).d;
  ok(savedWishlist.find((item) => String(item._id) === String(pA._id))?.available === false, 'wishlist vẫn hiển thị sản phẩm bị xóa mềm dưới dạng không còn bán');
  ok((await call('GET', `/products/${pA._id}`)).s === 404, 'sản phẩm đã xóa không còn trên sàn');
  ok((await call('GET', `/customer/orders/${ordA._id}`, null, C1)).d.items[0].productName === 'iPhone Test 128GB', 'đơn cũ vẫn giữ thông tin sản phẩm đã xóa');
  ok((await call('DELETE', `/admin/cskh/${csk._id}`, null, A)).s === 200, 'admin xóa mềm CSKH');
  ok((await call('POST', '/auth/login', { email: 'cs1@t.com', password: 'Pass@123' })).s === 401, 'CSKH đã xóa không đăng nhập được');
  const fp = (await call('POST', '/auth/forgot-password', { email: 'c2@t.com' })).d;
  ok((await call('POST', '/auth/reset-password', { token: fp.devResetToken, newPassword: 'NewPass@1' })).s === 200 && !!(await login('c2@t.com', 'NewPass@1')), 'quên mật khẩu -> đặt lại');
} catch (e) {
  console.error('LỖI NGOÀI DỰ KIẾN:', e);
  fails.push('exception: ' + e.message);
} finally {
  await mongoose.connection.dropDatabase().catch(() => {});
  server.close();
  await mongoose.disconnect();
}
console.log(`\n==== ${pass} đạt, ${fails.length} lỗi ====`);
process.exit(fails.length ? 1 : 0);
