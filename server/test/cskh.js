import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'local-cskh-test-only';
const mongo = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongo.getUri('cskh_test');
const { default: mongoose } = await import('mongoose');
const { default: app } = await import('../src/app.js');
const { connectDB } = await import('../src/db.js');
const { Complaint, Review } = await import('../src/models/Support.js');
const { Product } = await import('../src/models/Product.js');
const { createCskhFixtures } = await import('./cskh-fixtures.js');
let server;
let passed = 0;
function check(value, message) { assert.ok(value, message); passed++; }
try {
  await connectDB();
  const f = await createCskhFixtures();
  server = app.listen(0);
  await new Promise(resolve => server.listening ? resolve() : server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  async function call(method, path, token, body) {
    const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
    return { status: response.status, data: await response.json() };
  }
  const login = async email => {
    const response = await call('POST', '/auth/login', null, { email, password: 'Demo@123' });
    check(response.status === 200 && !!response.data.token, `đăng nhập ${email}`);
    return response.data.token;
  };
  const cs = await login(f.staff.email), cs2 = await login(f.otherStaff.email), customer = await login(f.customer.email), admin = await login(f.admin.email);
  check((await call('GET', '/staff/customers')).status === 401, 'chặn khách chưa đăng nhập');
  check((await call('GET', '/staff/customers', customer)).status === 403, 'chặn sai vai trò');
  check((await call('GET', '/staff/customers', admin)).status === 403, 'admin không dùng API dành riêng cho CSKH');
  check((await call('GET', `/staff/customers?q=${encodeURIComponent(f.customer.email)}`, cs)).data.total === 1, 'tìm khách theo email');
  check((await call('GET', '/staff/customers?q=0901000004', cs)).data.total === 1, 'tìm khách theo số điện thoại');
  const profile = (await call('GET', `/staff/customers/${f.customer._id}`, cs)).data;
  check(profile.addresses.length === 1 && profile.recentOrders[0].code === f.orders[0].code, 'chi tiết khách có địa chỉ và đơn gần đây');
  check(!profile.passwordHash, 'không lộ mật khẩu');
  check((await call('GET', '/staff/orders?q=NHOM_DEMO_1', cs)).data.total === 1, 'tìm đơn theo mã nhóm');
  check((await call('GET', `/staff/orders?q=${f.customer.email}`, cs)).data.total === 1, 'tìm đơn theo thông tin khách');
  check((await call('GET', '/staff/orders?status=da_huy', cs)).data.total === 0, 'lọc trạng thái đơn');
  check((await call('GET', `/staff/orders/${f.orders[0]._id}`, cs)).data.items[0].productName === f.product.name, 'chi tiết đơn có snapshot sản phẩm');
  check((await call('GET', '/staff/complaints?scope=pool&limit=10&page=2', cs)).data.items.length === 3, 'phân trang khiếu nại');
  check((await call('GET', '/staff/complaints?scope=invalid', cs)).status === 400, 'từ chối scope không hợp lệ');
  check((await call('GET', '/staff/complaints?q=KN_DEMO_001', cs)).data.total === 1, 'tìm mã khiếu nại');
  check((await call('GET', `/staff/complaints/${f.pool[0]._id}`, cs)).data.orderDetail.code === f.orders[0].code, 'chi tiết khiếu nại nối đơn hàng');
  check((await call('GET', `/staff/complaints/${f.other._id}`, cs)).status === 403, 'không xem đơn nhân viên khác phụ trách');
  check((await call('POST', `/staff/complaints/${f.pool[0]._id}/respond`, cs, { content: '   ' })).status === 400, 'không nhận đơn bằng phản hồi trắng');
  check(!(await Complaint.findById(f.pool[0]._id)).assignedTo, 'phản hồi sai không nhận quyền phụ trách');
  check((await call('POST', `/staff/complaints/${f.pool[0]._id}/respond`, cs, { content: '  Đã tiếp nhận  ' })).data.responses[0].content === 'Đã tiếp nhận', 'nhận và phản hồi khiếu nại');
  check((await call('POST', `/staff/complaints/${f.pool[0]._id}/respond`, cs2, { content: 'Chen ngang' })).status === 403, 'nhân viên khác không chen ngang');
  check((await call('POST', `/staff/complaints/${f.pool[0]._id}/escalate`, cs, { note: 'Cần admin quyết định' })).data.status === 'chuyen_admin', 'chuyển admin');
  for (const action of ['respond', 'resolve', 'escalate']) {
    check((await call('POST', `/staff/complaints/${f.pool[0]._id}/${action}`, cs, { content: 'Phản hồi', result: 'Đã xử lý', note: 'Chuyển tiếp' })).status === 400, `chặn ${action} sau chuyển admin`);
  }
  check((await call('GET', '/admin/complaints', admin)).data.items.some(c => c._id === String(f.pool[0]._id)), 'admin tiếp nhận đơn chuyển');
  check((await call('POST', `/admin/complaints/${f.pool[0]._id}/resolve`, admin, { result: 'Đã quyết định hỗ trợ khách' })).data.status === 'da_xu_ly', 'admin đóng khiếu nại');
  check((await call('GET', '/staff/complaints?scope=history', cs)).data.items.some(c => c._id === String(f.pool[0]._id)), 'lịch sử bao gồm đơn admin đóng');
  check(!(await call('GET', '/staff/complaints?scope=history', cs2)).data.items.some(c => c._id === String(f.pool[0]._id)), 'lịch sử chỉ gồm đơn mình phụ trách');
  check((await call('GET', `/customer/complaints/${f.pool[0]._id}`, customer)).data.result === 'Đã quyết định hỗ trợ khách', 'khách đọc được phản hồi và kết quả');
  check((await call('POST', `/staff/complaints/${f.mine._id}/resolve`, cs, { result: 'Đã gửi bù phụ kiện' })).data.status === 'da_xu_ly', 'CSKH tự hoàn tất');
  check((await call('POST', `/staff/complaints/${f.mine._id}/respond`, cs, { content: 'Mở lại' })).status === 400, 'không phản hồi đơn đã đóng');
  check((await call('GET', '/staff/reviews?q=Sony&rating=2', cs)).data.total === 1, 'lọc đánh giá theo tên sản phẩm và sao');
  check((await call('GET', '/staff/reviews?q=%5Bb%E1%BA%A3n%20c%C5%A9%5D', cs)).data.total === 1, 'tra cứu cả sản phẩm xóa mềm, ký tự regex được escape');
  check((await call('GET', `/staff/reviews?product=${f.hiddenProduct._id}&q=Sony`, cs)).data.total === 0, 'kết hợp ID sản phẩm và tên');
  check((await call('DELETE', `/staff/reviews/${f.reviews[1]._id}`, customer)).status === 403, 'khách không xóa review của người khác');
  check((await call('DELETE', `/staff/reviews/${f.reviews[1]._id}`, cs)).status === 200, 'CSKH xóa review');
  const removed = await Review.findById(f.reviews[1]._id);
  check(removed.isDeleted && String(removed.deletedBy) === String(f.staff._id), 'xóa mềm và lưu người xóa');
  const product = await Product.findById(f.product._id);
  check(product.ratingCount === 1 && product.ratingAvg === 4, 'tính lại điểm sản phẩm');
  check((await call('DELETE', `/staff/reviews/${f.reviews[1]._id}`, cs)).status === 404, 'xóa lại review trả 404');

  // Kiểm tra mọi cặp thao tác khi HAI nhân viên cùng tác động lên một đơn mới.
  const bodies = { respond: { content: 'Nhận xử lý' }, resolve: { result: 'Giải quyết xong' }, escalate: { note: 'Cần admin xử lý' } };
  for (let round = 0; round < 3; round++) for (const a of Object.keys(bodies)) for (const b of Object.keys(bodies)) {
    const c = await f.makeComplaint(`KN_RACE_${round}_${a}_${b}`);
    const responses = await Promise.all([call('POST', `/staff/complaints/${c._id}/${a}`, cs, bodies[a]), call('POST', `/staff/complaints/${c._id}/${b}`, cs2, bodies[b])]);
    check(responses.filter(r => r.status === 200).length === 1 && responses.filter(r => r.status === 403).length === 1, `chỉ một nhân viên thắng: ${round}/${a}/${b}`);
    const saved = await Complaint.findById(c._id);
    const winner = responses[0].status === 200 ? f.staff : f.otherStaff;
    check(String(saved.assignedTo) === String(winner._id) && saved.responses.every(r => String(r.by) === String(winner._id)), 'không lưu phản hồi/người phụ trách của bên thua');
  }
  // Hai phản hồi của CÙNG người phụ trách không làm mất nội dung nhau.
  const same = await f.makeComplaint('KN_SAME_STAFF');
  await call('POST', `/staff/complaints/${same._id}/respond`, cs, { content: 'Đầu tiên' });
  const replies = await Promise.all(['Thứ hai', 'Thứ ba'].map(content => call('POST', `/staff/complaints/${same._id}/respond`, cs, { content })));
  check(replies.every(r => r.status === 200) && (await Complaint.findById(same._id)).responses.length === 3, 'cập nhật đồng thời không mất phản hồi cùng nhân viên');
  check((await call('POST', '/auth/logout', cs)).status === 200, 'đăng xuất');
  f.staff.status = 'locked'; await f.staff.save();
  check((await call('GET', '/staff/customers', cs)).status === 403, 'khóa tài khoản có hiệu lực với token cũ');
  check((await call('POST', '/auth/login', null, { email: f.staff.email, password: 'Demo@123' })).status === 403, 'CSKH bị khóa không đăng nhập được');
  console.log(`CSKH: ${passed} kiểm tra đạt; 27 tình huống tranh chấp được bảo vệ. Chỉ sử dụng MongoDB tạm.`);
} finally {
  if (server) await new Promise(resolve => server.close(resolve));
  await mongoose.disconnect();
  await mongo.stop();
}
