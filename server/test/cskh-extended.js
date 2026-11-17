import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'extended-cskh-test-only';
const mongo = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongo.getUri('cskh_test');
const { default: mongoose } = await import('mongoose');
const { default: app } = await import('../src/app.js');
const { connectDB } = await import('../src/db.js');
const { signToken } = await import('../src/middleware/auth.js');
const { default: User } = await import('../src/models/User.js');
const { default: Shop } = await import('../src/models/Shop.js');
const { Complaint, Review } = await import('../src/models/Support.js');
const { Product } = await import('../src/models/Product.js');
const { recalcRatings } = await import('../src/services/ratingService.js');
const { createCskhFixtures } = await import('./cskh-fixtures.js');
const failures = [];
let passed = 0;
let server;
function check(condition, name) { if (condition) passed++; else { failures.push(name); console.error('FAIL:', name); } }
try {
  await connectDB();
  const f = await createCskhFixtures();
  const seller = await User.findOne({ role: 'seller' });
  const cs = signToken(f.staff), cs2 = signToken(f.otherStaff);
  server = app.listen(0);
  await new Promise(resolve => server.listening ? resolve() : server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  async function call(method, path, token = cs, body) {
    const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined || method === 'GET' ? undefined : JSON.stringify(body) });
    return { status: response.status, data: await response.json() };
  }
  const routes = [
    ['GET', '/staff/customers'], ['GET', `/staff/customers/${f.customer._id}`],
    ['GET', '/staff/orders'], ['GET', `/staff/orders/${f.orders[0]._id}`],
    ['GET', '/staff/complaints'], ['GET', `/staff/complaints/${f.pool[0]._id}`],
    ...['respond', 'resolve', 'escalate'].map(action => ['POST', `/staff/complaints/${f.pool[0]._id}/${action}`]),
    ['GET', '/staff/reviews'], ['DELETE', `/staff/reviews/${f.reviews[0]._id}`],
  ];
  const accessCases = [
    ['anonymous', null, 401], ['invalid JWT', 'not.a.token', 401],
    ['expired JWT', jwt.sign({ id: f.staff._id }, process.env.JWT_SECRET, { expiresIn: -1 }), 401],
    ['customer', signToken(f.customer), 403], ['seller', signToken(seller), 403], ['admin', signToken(f.admin), 403],
  ];
  for (const [name, token, expected] of accessCases) for (const [method, path] of routes) {
    const response = await call(method, path, token, { content: 'Xin nhận xử lý', result: 'Đã xử lý', note: 'Xin chuyển admin' });
    check(response.status === expected, `${name} bị chặn: ${method} ${path}`);
  }
  check(!(await Complaint.findById(f.pool[0]._id)).assignedTo && !(await Review.findById(f.reviews[0]._id)).isDeleted, 'thao tác trái quyền không làm thay đổi dữ liệu');
  for (const path of ['/admin/cskh', '/admin/customers', '/seller/products', '/customer/profile']) check((await call('GET', path)).status === 403, `CSKH không vượt quyền ${path}`);

  for (const scope of ['__proto__', 'constructor', 'toString', 'hasOwnProperty', 'invalid', '']) {
    const response = await call('GET', `/staff/complaints?scope=${encodeURIComponent(scope)}`);
    check(response.status === 400 && !response.data.items, `scope không hợp lệ không lộ dữ liệu: ${scope}`);
  }
  for (const query of ['scope[]=mine', 'scope[$ne]=mine', 'q[$ne]=x', 'q[]=x', 'q=' + 'a'.repeat(201), 'page=0', 'page=-1', 'page=abc', 'page=1.5', 'page=' + '9'.repeat(400), 'limit=0']) {
    check((await call('GET', `/staff/complaints?${query}`)).status === 400, `từ chối query sai: ${query.slice(0, 55)}`);
  }
  for (const query of ['product[$ne]=x', 'product=invalid', 'rating=0', 'rating=6', 'rating=NaN', 'rating[]=2']) check((await call('GET', `/staff/reviews?${query}`)).status === 400, `từ chối bộ lọc review sai ${query}`);
  for (const query of ['status[$ne]=x', 'status=invalid']) check((await call('GET', `/staff/orders?${query}`)).status === 400, `từ chối trạng thái đơn sai ${query}`);
  for (const [method, resource] of [['GET', 'customers'], ['GET', 'orders'], ['GET', 'complaints'], ['DELETE', 'reviews']]) {
    check((await call(method, `/staff/${resource}/invalid-id`)).status === 400, `ID sai /${resource}`);
    check((await call(method, `/staff/${resource}/${f.objectId()}`)).status === 404, `ID không tồn tại /${resource}`);
  }
  check((await call('GET', `/staff/customers/${f.staff._id}`)).status === 404, 'không nhầm nhân viên thành khách hàng');
  check((await call('GET', '/staff/customers?q=' + encodeURIComponent('LÊ THU'))).data.total === 1, 'tìm tên tiếng Việt, không phân biệt hoa thường');
  check((await call('GET', '/staff/orders?q=nhom_demo_1')).data.total === 1, 'tìm mã nhóm không phân biệt hoa thường');
  for (const resource of ['customers', 'orders', 'complaints', 'reviews']) {
    check((await call('GET', `/staff/${resource}?q=${encodeURIComponent('.*')}`)).data.total === 0, `regex được coi là chuỗi thường /${resource}`);
    const empty = await call('GET', `/staff/${resource}?q=does-not-exist`);
    check(empty.status === 200 && empty.data.items.length === 0 && empty.data.totalPages === 1, `kết quả rỗng hợp lệ /${resource}`);
  }
  check((await call('GET', '/staff/customers?q=%20%20L%C3%AA%20Thu%20%20')).data.total === 1, 'trim khoảng trắng tìm kiếm API');
  check((await call('GET', '/staff/customers?limit=1000')).data.limit === 100, 'limit được giới hạn tối đa 100');
  const pages = await Promise.all([1, 2].map(page => call('GET', `/staff/complaints?scope=pool&limit=10&page=${page}`)));
  check(new Set(pages.flatMap(page => page.data.items.map(item => item._id))).size === 13, 'phân trang không trùng hoặc mất khiếu nại');
  check((await call('GET', `/staff/complaints?scope=mine&q=${f.other.code}`)).data.total === 0, 'tìm kiếm không mở rộng quyền sang nhân viên khác');
  f.otherCustomer.isDeleted = true; await f.otherCustomer.save();
  check((await call('GET', `/staff/customers?q=${f.otherCustomer.email}`)).data.total === 0 && (await call('GET', `/staff/customers/${f.otherCustomer._id}`)).status === 404, 'không trả tài khoản khách đã xóa mềm');

  for (const [action, field, min] of [['respond', 'content', 2], ['resolve', 'result', 3], ['escalate', 'note', 3]]) {
    for (const invalid of [undefined, null, 123, [], {}, true, '', ' '.repeat(5), 'x'.repeat(min - 1), 'x'.repeat(2001)]) {
      const body = invalid === undefined ? {} : { [field]: invalid };
      const response = await call('POST', `/staff/complaints/${f.pool[0]._id}/${action}`, cs, body);
      check(response.status === 400, `kiểm tra ${action} dữ liệu ${JSON.stringify(invalid)?.slice(0, 30)}`);
    }
    check(!(await Complaint.findById(f.pool[0]._id)).assignedTo, `${action} sai không nhận đơn`);
    for (const length of [min, 2000]) {
      const complaint = await f.makeComplaint(`KN_BOUND_${action}_${length}`);
      const response = await call('POST', `/staff/complaints/${complaint._id}/${action}`, cs, { [field]: 'x'.repeat(length) });
      check(response.status === 200, `${action} chấp nhận độ dài biên ${length}`);
    }
  }
  const forged = await f.makeComplaint('KN_FORGED_FIELDS');
  const write = await call('POST', `/staff/complaints/${forged._id}/respond`, cs, { content: '<script>alert(1)</script>\nPhản hồi có xuống dòng', assignedTo: f.otherStaff._id, status: 'da_xu_ly', role: 'admin' });
  check(write.status === 200 && write.data.assignedTo === String(f.staff._id) && write.data.status === 'dang_xu_ly' && write.data.responses[0].role === 'cskh', 'không giả mạo người phụ trách, trạng thái, vai trò qua body');
  check((await call('GET', `/staff/complaints/${forged._id}`, cs2)).status === 403, 'nhân viên khác không đọc chi tiết sau nhận đơn');
  for (const action of ['respond', 'resolve', 'escalate']) check((await call('POST', `/staff/complaints/${forged._id}/${action}`, cs2, { content: 'Phản hồi', result: 'Kết quả', note: 'Lý do' })).status === 403, `người khác không ${action} đơn đã nhận`);
  for (const action of ['respond', 'resolve', 'escalate']) check((await call('POST', `/staff/complaints/${f.closed._id}/${action}`, cs, { content: 'Phản hồi', result: 'Kết quả', note: 'Lý do' })).status === 400, `không ${action} đơn đóng`);
  const old = await f.makeComplaint('KN_HISTORY_OLD', { status: 'da_xu_ly', assignedTo: f.staff._id, resolvedAt: new Date('2020-01-01'), result: 'Xong từ trước' });
  const recent = await f.makeComplaint('KN_HISTORY_NEW', { status: 'da_xu_ly', assignedTo: f.staff._id, resolvedAt: new Date('2099-01-01'), result: 'Xong sau cùng' });
  const history = (await call('GET', '/staff/complaints?scope=history&limit=100')).data.items;
  check(history.findIndex(c => c._id === String(recent._id)) < history.findIndex(c => c._id === String(old._id)), 'lịch sử sắp theo thời điểm hoàn tất');

  const duplicateReview = await Review.create({ order: f.objectId(), product: f.product._id, shop: f.shop._id, customer: f.customer._id, rating: 5, content: 'Kiểm tra xóa đồng thời' });
  const deletions = await Promise.all([cs, cs2].map(token => call('DELETE', `/staff/reviews/${duplicateReview._id}`, token)));
  check(deletions.filter(r => r.status === 200).length === 1 && deletions.filter(r => r.status === 404).length === 1, 'hai người xóa cùng review chỉ một người thành công');
  const deleted = await Review.findById(duplicateReview._id);
  check(String(deleted.deletedBy) === String(deletions[0].status === 200 ? f.staff._id : f.otherStaff._id), 'không ghi đè người thực sự xóa review');
  for (let round = 0; round < 15; round++) {
    const reviews = await Review.create([1, 2, 4, 5].map(rating => ({ order: f.objectId(), product: f.product._id, shop: f.shop._id, customer: f.customer._id, rating })));
    await recalcRatings(f.product._id, f.shop._id);
    const responses = await Promise.all(reviews.map((review, index) => call('DELETE', `/staff/reviews/${review._id}`, index % 2 ? cs2 : cs)));
    const activeProduct = await Review.find({ product: f.product._id, isDeleted: false }).lean();
    const activeShop = await Review.find({ shop: f.shop._id, isDeleted: false }).lean();
    const [product, shop] = await Promise.all([Product.findById(f.product._id).lean(), Shop.findById(f.shop._id).lean()]);
    const average = records => records.length ? Math.round(records.reduce((sum, record) => sum + record.rating, 0) / records.length * 10) / 10 : 0;
    check(responses.every(r => r.status === 200) && product.ratingCount === activeProduct.length && product.ratingAvg === average(activeProduct) && shop.ratingCount === activeShop.length && shop.ratingAvg === average(activeShop), `xóa nhiều review đồng thời không lệch điểm sản phẩm/gian hàng, vòng ${round}`);
  }
  check((await call('POST', '/auth/login', null, { email: f.staff.email, password: 'wrong-password' })).status === 401, 'sai mật khẩu CSKH');
  f.staff.isDeleted = true; await f.staff.save();
  check((await call('GET', '/staff/customers')).status === 401, 'nhân viên đã xóa không dùng token cũ');
  check((await call('POST', '/auth/login', null, { email: f.staff.email, password: 'Demo@123' })).status === 401, 'nhân viên đã xóa không đăng nhập được');
  console.log(JSON.stringify({ suite: 'CSKH mở rộng', passed, failed: failures.length, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  if (server) await new Promise(resolve => server.close(resolve));
  await mongoose.disconnect();
  await mongo.stop();
}
