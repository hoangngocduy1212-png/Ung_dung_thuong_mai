import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'full-cycle-cskh-test-secret';
const mongo = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongo.getUri('cskh_test');

const { default: mongoose } = await import('mongoose');
const { default: app } = await import('../src/app.js');
const { connectDB } = await import('../src/db.js');
const { Complaint, Review, AfterSales } = await import('../src/models/Support.js');
const { createCskhFixtures } = await import('./cskh-fixtures.js');

let server;
let passed = 0;
function check(value, message) {
  assert.ok(value, message);
  passed++;
  console.log(`  ✓ PASS: ${message}`);
}

try {
  console.log('\n========================================');
  console.log('▶ CSKH FULL-CYCLE INTEGRATION & SECURITY TEST SUITE');
  console.log('========================================\n');

  await connectDB();
  const f = await createCskhFixtures();
  server = app.listen(0);
  await new Promise((resolve) => (server.listening ? resolve() : server.once('listening', resolve)));
  const base = `http://127.0.0.1:${server.address().port}/api`;

  async function call(method, path, token, body) {
    const response = await fetch(base + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: response.status, data: await response.json() };
  }

  const login = async (email) => {
    const res = await call('POST', '/auth/login', null, { email, password: 'Demo@123' });
    check(res.status === 200 && !!res.data.token, `Đăng nhập thành công: ${email}`);
    return res.data.token;
  };

  const csToken = await login(f.staff.email);
  const otherCsToken = await login(f.otherStaff.email);
  const custToken = await login(f.customer.email);
  const adminToken = await login(f.admin.email);

  console.log('\n--- 1. CSKH Summary KPI Endpoint ---');
  const summaryRes = await call('GET', '/staff/summary', csToken);
  check(summaryRes.status === 200, 'GET /staff/summary trả về HTTP 200');
  check(typeof summaryRes.data.pool === 'number', 'summary.pool là số nguyên');
  check(typeof summaryRes.data.mine === 'number', 'summary.mine là số nguyên');
  check(typeof summaryRes.data.history === 'number', 'summary.history là số nguyên');

  console.log('\n--- 2. Tạo Khiếu nại từ Customer (orderCode & orderId) ---');
  const { default: Order } = await import('../src/models/Order.js');

  const newOrder1 = await Order.create({
    code: 'DH_CYCLE_001',
    groupCode: 'NHOM_CYCLE_001',
    customer: f.customer._id,
    shop: f.shop._id,
    subtotal: 2000000,
    shippingFee: 30000,
    discount: 0,
    total: 2030000,
    sellerRevenue: 2000000,
    status: 'hoan_tat',
    items: [{ product: f.product._id, productName: f.product.name, price: 2000000, quantity: 1 }],
    payment: { method: 'cod', status: 'paid', paidAt: new Date() },
    shippingAddress: { receiver: f.customer.fullName, phone: f.customer.phone, detail: '12 Nguyễn Huệ' },
  });

  const newOrder2 = await Order.create({
    code: 'DH_CYCLE_002',
    groupCode: 'NHOM_CYCLE_002',
    customer: f.customer._id,
    shop: f.shop._id,
    subtotal: 3000000,
    shippingFee: 30000,
    discount: 0,
    total: 3030000,
    sellerRevenue: 3000000,
    status: 'hoan_tat',
    items: [{ product: f.product._id, productName: f.product.name, price: 3000000, quantity: 1 }],
    payment: { method: 'cod', status: 'paid', paidAt: new Date() },
    shippingAddress: { receiver: f.customer.fullName, phone: f.customer.phone, detail: '12 Nguyễn Huệ' },
  });

  // Tạo khiếu nại bằng orderCode
  const comp1 = await call('POST', '/customer/complaints', custToken, {
    contactName: 'Khách Test A',
    contactPhone: '0901000004',
    contactEmail: 'customer@test.com',
    orderCode: newOrder1.code,
    reason: 'Sản phẩm giao thiếu phụ kiện sạc pin',
  });
  check(comp1.status === 201, 'Tạo khiếu nại bằng orderCode thành công (HTTP 201)');
  check(comp1.data.code.startsWith('KN'), 'Mã khiếu nại bắt đầu bằng KN');
  check(comp1.data.status === 'moi', 'Trạng thái ban đầu là "moi"');

  // Chống gửi trùng khiếu nại đang mở trên cùng đơn
  const dupComp = await call('POST', '/customer/complaints', custToken, {
    contactName: 'Khách Test A',
    contactPhone: '0901000004',
    orderCode: newOrder1.code,
    reason: 'Gửi lại lần nữa vì nôn nóng',
  });
  check(dupComp.status === 409, 'Chặn gửi trùng khiếu nại đang mở (HTTP 409 Conflict)');

  // Tạo khiếu nại bằng orderId trên đơn thứ 2
  const comp2 = await call('POST', '/customer/complaints', custToken, {
    contactName: 'Khách Test A',
    contactPhone: '0901000004',
    orderId: String(newOrder2._id),
    reason: 'Hàng bị trầy xước cạnh viền máy',
  });
  check(comp2.status === 201, 'Tạo khiếu nại bằng orderId thành công (HTTP 201)');

  console.log('\n--- 3. Khách hàng nhắn thêm thông tin vào khiếu nại ---');
  const msgRes = await call('POST', `/customer/complaints/${comp1.data._id}/messages`, custToken, {
    content: 'Tôi đã kiểm tra kỹ lại hộp hàng, đúng là không có cáp sạc.',
  });
  check(msgRes.status === 200, 'Khách gửi thêm tin nhắn bổ sung thành công (HTTP 200)');
  check(msgRes.data.responses.length === 1, 'Lưu đúng phản hồi của khách');
  check(msgRes.data.responses[0].role === 'customer', 'Gán đúng role là "customer"');

  console.log('\n--- 4. CSKH Tra cứu Đơn hàng kèm After-Sales & Complaints ---');
  const orderDetailRes = await call('GET', `/staff/orders/${newOrder1._id}`, csToken);
  check(orderDetailRes.status === 200, 'CSKH lấy chi tiết đơn thành công');
  check(Array.isArray(orderDetailRes.data.afterSales), 'Chi tiết đơn có mảng afterSales');
  check(Array.isArray(orderDetailRes.data.complaints), 'Chi tiết đơn có mảng complaints');
  check(orderDetailRes.data.complaints.some((c) => c.code === comp1.data.code), 'Mảng complaints chứa khiếu nại vừa tạo');

  console.log('\n--- 5. CSKH Tiếp nhận, Phản hồi và Xử lý Khiếu nại ---');
  // CSKH phản hồi
  const respondRes = await call('POST', `/staff/complaints/${comp1.data._id}/respond`, csToken, {
    content: 'Dạ TechStore chào anh, chúng tôi đang liên hệ kho để kiểm tra lại camera đóng gói ạ.',
  });
  check(respondRes.status === 200, 'CSKH phản hồi thành công (HTTP 200)');
  check(respondRes.data.status === 'dang_xu_ly', 'Trạng thái chuyển sang "dang_xu_ly"');
  check(String(respondRes.data.assignedTo) === String(f.staff._id), 'Tự động gán quyền phụ trách cho nhân viên phản hồi');

  // CSKH khác không được chen ngang
  const hijackRes = await call('POST', `/staff/complaints/${comp1.data._id}/respond`, otherCsToken, {
    content: 'Nhân viên khác chen vào',
  });
  check(hijackRes.status === 403, 'Chặn nhân viên khác can thiệp hồ sơ đã có người phụ trách (HTTP 403)');

  // CSKH giải quyết hoàn tất
  const resolveRes = await call('POST', `/staff/complaints/${comp1.data._id}/resolve`, csToken, {
    result: 'Kho xác nhận thiếu phụ kiện, đã gửi chuyển phát nhanh cáp sạc mới cho khách.',
  });
  check(resolveRes.status === 200, 'CSKH giải quyết hoàn tất thành công (HTTP 200)');
  check(resolveRes.data.status === 'da_xu_ly', 'Trạng thái hồ sơ là "da_xu_ly"');
  check(resolveRes.data.result.includes('gửi chuyển phát nhanh'), 'Lưu đúng kết quả giải quyết');

  // Khách không được gửi thêm tin nhắn khi khiếu nại đã đóng
  const closedMsgRes = await call('POST', `/customer/complaints/${comp1.data._id}/messages`, custToken, {
    content: 'Tin nhắn sau khi đã đóng',
  });
  check(closedMsgRes.status === 400, 'Chặn khách gửi tin nhắn vào khiếu nại đã đóng (HTTP 400)');

  console.log('\n--- 6. CSKH Chuyển Admin và Quyết định của Admin ---');
  // CSKH phản hồi đơn 2 rồi chuyển Admin
  await call('POST', `/staff/complaints/${comp2.data._id}/respond`, csToken, {
    content: 'TechStore đã tiếp nhận yêu cầu trầy xước máy của quý khách.',
  });
  const escalateRes = await call('POST', `/staff/complaints/${comp2.data._id}/escalate`, csToken, {
    note: 'Khách yêu cầu đổi máy mới nguyên seal, cần Quản trị viên duyệt',
  });
  check(escalateRes.status === 200, 'Chuyển Admin thành công (HTTP 200)');
  check(escalateRes.data.status === 'chuyen_admin', 'Trạng thái chuyển thành "chuyen_admin"');

  // Admin duyệt giải quyết
  const adminResolveRes = await call('POST', `/admin/complaints/${comp2.data._id}/resolve`, adminToken, {
    result: 'Đồng ý thu hồi máy xước và xuất máy mới cho khách hàng.',
  });
  check(adminResolveRes.status === 200, 'Admin phân xử và đóng hồ sơ thành công (HTTP 200)');
  check(adminResolveRes.data.status === 'da_xu_ly', 'Trạng thái cuối cùng là "da_xu_ly"');

  console.log('\n--- 7. Bảo vệ IDOR & Phân quyền ---');
  // Khách không được xem khiếu nại của khách khác
  const fakeOtherCustomerOrder = await call('POST', '/customer/complaints', custToken, {
    contactName: 'Hack',
    contactPhone: '0901000004',
    orderCode: 'DH_CUA_NGUOI_KHAC',
    reason: 'Cố tình khiếu nại đơn không thuộc về mình',
  });
  check(fakeOtherCustomerOrder.status === 404, 'Chặn khiếu nại mã đơn của tài khoản khác (HTTP 404)');

  console.log(`\n======================================================`);
  console.log(`TỔNG KẾT: ${passed} bài kiểm thử toàn trình CSKH đạt chuẩn 100%!`);
  console.log(`======================================================\n`);
} finally {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  await mongo.stop();
}
