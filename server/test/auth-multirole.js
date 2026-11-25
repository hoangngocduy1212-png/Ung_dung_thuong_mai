// Kiểm thử nghiệp vụ đăng ký đa vai trò (Multi-role Registration)
// Customer, Seller Owner, Seller Staff, Active Shops List, Role approval workflow
process.env.NODE_ENV = 'test';
const base = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/x';
process.env.MONGODB_URI = base.replace(/\/[^/?]*(\?|$)/, `/auth_multirole_test_${Date.now()}$1`);

const { default: mongoose } = await import('mongoose');
const { default: app } = await import('../src/app.js');
const { connectDB } = await import('../src/db.js');
const { default: User } = await import('../src/models/User.js');
const { default: Shop } = await import('../src/models/Shop.js');
const bcrypt = (await import('bcryptjs')).default;

await connectDB();
const server = app.listen(0);
const url = `http://127.0.0.1:${server.address().port}/api`;

let pass = 0;
const fails = [];
const ok = (cond, msg) => {
  if (cond) {
    pass++;
    console.log('  ✓ PASS:', msg);
  } else {
    fails.push(msg);
    console.log('  ✗ FAIL:', msg);
  }
};
const section = (t) => console.log('\n▶', t);

async function call(method, path, body, token, customHeaders = {}) {
  const res = await fetch(url + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...customHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  return { s: res.status, d: data, headers: res.headers };
}

try {
  // 1. Tạo admin hệ thống để duyệt gian hàng
  await User.create({
    email: 'admin@system.test',
    phone: '0900000001',
    fullName: 'System Admin',
    role: 'admin',
    passwordHash: await bcrypt.hash('Admin@123', 10),
  });

  const adminLogin = await call('POST', '/auth/login', {
    email: 'admin@system.test',
    password: 'Admin@123',
  });
  ok(adminLogin.s === 200 && adminLogin.d.token, 'Admin đăng nhập thành công');
  const adminToken = adminLogin.d.token;

  section('1. Kiểm tra danh sách gian hàng đang hoạt động (/auth/shops)');
  const initialShops = await call('GET', '/auth/shops');
  ok(initialShops.s === 200, 'GET /auth/shops trả về mã 200');
  ok(Array.isArray(initialShops.d), 'GET /auth/shops trả về một mảng');
  ok(initialShops.d.length === 0, 'Chưa có gian hàng hoạt động nào ban đầu');

  section('2. Đăng ký tài khoản Khách hàng (Customer)');
  const customerReg = await call('POST', '/auth/register', {
    fullName: 'Nguyen Van Khach',
    email: 'khachhang@example.com',
    phone: '0912345678',
    password: 'Password@123',
  });
  ok(customerReg.s === 201, 'Đăng ký khách hàng thành công (HTTP 201)');
  ok(!!customerReg.d.token, 'Đăng ký khách hàng trả về JWT token');
  ok(customerReg.d.user?.role === 'customer', 'Tài khoản có role = "customer"');

  // Khách hàng đăng nhập lại
  const customerLogin = await call('POST', '/auth/login', {
    email: 'khachhang@example.com',
    password: 'Password@123',
  });
  ok(customerLogin.s === 200 && !!customerLogin.d.token, 'Khách hàng đăng nhập thành công');

  section('3. Đăng ký tài khoản Chủ gian hàng (Seller Owner)');
  const ownerReg = await call('POST', '/auth/register-seller', {
    fullName: 'Tran Van Chu Shop',
    email: 'chushop@example.com',
    phone: '0987654321',
    password: 'Password@123',
    sellerType: 'owner',
    shopName: 'TechStore Monolith Flagship',
    shopDescription: 'Gian hàng công nghệ cao cấp chính hãng',
  });
  ok(ownerReg.s === 201, 'Đăng ký chủ gian hàng thành công (HTTP 201)');
  ok(!!ownerReg.d.token, 'Chủ gian hàng nhận được JWT token ngay khi đăng ký');
  ok(ownerReg.d.user?.role === 'seller', 'Role người dùng là "seller"');
  ok(ownerReg.d.user?.sellerRole === 'owner', 'SellerRole là "owner"');
  ok(ownerReg.d.user?.status === 'active', 'User status của chủ shop là "active"');
  ok(!!ownerReg.d.user?.shop, 'User được gắn mã gian hàng vừa tạo');

  const createdShop = await Shop.findById(ownerReg.d.user.shop);
  ok(createdShop?.status === 'pending', 'Gian hàng mới tạo ở trạng thái "pending" (chờ admin duyệt)');
  ok(createdShop?.name === 'TechStore Monolith Flagship', 'Tên gian hàng lưu đúng');

  section('4. Chống trùng lặp tên gian hàng (Duplicate Shop Name)');
  const duplicateOwnerReg = await call('POST', '/auth/register-seller', {
    fullName: 'Le Van Khac',
    email: 'khac@example.com',
    phone: '0933333333',
    password: 'Password@123',
    sellerType: 'owner',
    shopName: 'TechStore Monolith Flagship', // trùng tên
  });
  ok(duplicateOwnerReg.s === 409, 'Đăng ký trùng tên gian hàng bị từ chối với mã 409 Conflict');

  section('5. Admin duyệt gian hàng & Kiểm tra GET /auth/shops');
  // Admin duyệt gian hàng thành active
  const approveRes = await call('PATCH', `/admin/shops/${createdShop._id}/approve`, {}, adminToken);
  ok(approveRes.s === 200, 'Admin duyệt gian hàng thành công');

  const updatedShops = await call('GET', '/auth/shops');
  ok(updatedShops.s === 200 && updatedShops.d.length === 1, 'GET /auth/shops giờ đã trả về gian hàng active');
  ok(updatedShops.d[0]._id === String(createdShop._id), 'ID gian hàng khớp chính xác');
  ok(updatedShops.d[0].name === 'TechStore Monolith Flagship', 'Tên gian hàng hiển thị trong danh sách');

  section('6. Đăng ký tài khoản Nhân viên gian hàng (Seller Staff)');
  const staffReg = await call('POST', '/auth/register-seller', {
    fullName: 'Pham Thi Nhan Vien',
    email: 'nhanvien@example.com',
    phone: '0944444444',
    password: 'Password@123',
    sellerType: 'staff',
    shopId: String(createdShop._id),
  });
  ok(staffReg.s === 201, 'Đăng ký nhân viên gian hàng thành công (HTTP 201)');
  ok(!staffReg.d.token, 'BẢO MẬT: Nhân viên chưa duyệt KHÔNG được cấp token');
  ok(staffReg.d.user?.role === 'seller', 'User role = "seller"');
  ok(staffReg.d.user?.sellerRole === 'staff', 'User sellerRole = "staff"');
  ok(staffReg.d.user?.status === 'pending', 'User status = "pending" (chờ chủ shop duyệt)');
  ok(staffReg.d.user?.shop === String(createdShop._id), 'User được liên kết đúng với gian hàng');

  section('7. Kiểm tra chặn đăng nhập với nhân viên đang pending');
  const staffLoginPending = await call('POST', '/auth/login', {
    email: 'nhanvien@example.com',
    password: 'Password@123',
  });
  ok(staffLoginPending.s === 403, 'Đăng nhập nhân viên pending bị từ chối với HTTP 403');
  ok(
    staffLoginPending.d.message && staffLoginPending.d.message.includes('chờ'),
    'Thông báo nêu rõ tài khoản đang chờ phê duyệt'
  );

  section('8. Kiểm tra từ chối đăng ký nhân viên vào gian hàng không tồn tại');
  const fakeShopId = new mongoose.Types.ObjectId().toString();
  const invalidStaffReg = await call('POST', '/auth/register-seller', {
    fullName: 'Nhan Vien Ao',
    email: 'ao@example.com',
    phone: '0955555555',
    password: 'Password@123',
    sellerType: 'staff',
    shopId: fakeShopId,
  });
  ok(invalidStaffReg.s === 404, 'Đăng ký vào gian hàng không tồn tại bị trả về HTTP 404');

  section('9. Chủ gian hàng duyệt nhân viên');
  const ownerToken = ownerReg.d.token;
  // Chủ gian hàng cập nhật trạng thái nhân viên thành active
  const activateStaff = await call(
    'PATCH',
    `/seller/staff/${staffReg.d.user._id}/approve`,
    {},
    ownerToken
  );
  ok(activateStaff.s === 200, 'Chủ gian hàng duyệt nhân viên thành active thành công');

  // Sau khi được duyệt, nhân viên đăng nhập thành công
  const staffLoginActive = await call('POST', '/auth/login', {
    email: 'nhanvien@example.com',
    password: 'Password@123',
  });
  ok(staffLoginActive.s === 200 && !!staffLoginActive.d.token, 'Nhân viên đã duyệt đăng nhập thành công');
  ok(staffLoginActive.d.user?.sellerRole === 'staff', 'Thông tin phiên là seller staff');
  ok(staffLoginActive.d.shop?.name === 'TechStore Monolith Flagship', 'Phiên làm việc trả về thông tin gian hàng');

  section('10. Hardening: Chống Shop mồ côi (Shop Orphan Cleanup upon Failure)');
  // Giả lập sự cố xảy ra khi lưu user.save() sau khi Shop.create() đã thành công
  const origSave = User.prototype.save;
  let simulateSaveError = false;
  User.prototype.save = async function (...args) {
    if (simulateSaveError && this.email === 'rollback_test@example.com') {
      throw new Error('SIMULATED_DB_DISCONNECT_ERROR');
    }
    return origSave.apply(this, args);
  };

  simulateSaveError = true;
  const failOwnerReg = await call('POST', '/auth/register-seller', {
    fullName: 'Rollback Tester',
    email: 'rollback_test@example.com',
    phone: '0977777777',
    password: 'Password@123',
    sellerType: 'owner',
    shopName: 'Rollback Test Shop',
  });
  ok(failOwnerReg.s === 500, 'Đăng ký gặp sự cố hệ thống ném HTTP 500');

  // Xác minh: User đã bị xóa (rollback)
  const userCheck = await User.findOne({ email: 'rollback_test@example.com' });
  ok(!userCheck, 'User được rollback sạch sẽ, không lưu vào DB');

  // Xác minh: Shop đã bị xóa (rollback), không để lại Shop mồ côi
  const shopCheck = await Shop.findOne({ nameKey: 'rollback test shop' });
  ok(!shopCheck, 'Shop được rollback sạch sẽ, không để lại Shop mồ côi');

  // Xác minh: Tên gian hàng được giải phóng và có thể đăng ký lại bình thường
  simulateSaveError = false;
  const retryOwnerReg = await call('POST', '/auth/register-seller', {
    fullName: 'Rollback Tester',
    email: 'rollback_test@example.com',
    phone: '0977777777',
    password: 'Password@123',
    sellerType: 'owner',
    shopName: 'Rollback Test Shop', // Tên shop cũ
  });
  ok(retryOwnerReg.s === 201, 'Đăng ký lại tên shop vừa rollback thành công (HTTP 201)');

  // Khôi phục lại prototype
  User.prototype.save = origSave;

  section('11. Hardening: Kiểm tra Rate Limiting (Chống brute-force & spam)');
  const testHeaders = { 'x-test-rate-limit': 'true' };

  // 5 request đầu tiên dưới ngưỡng giới hạn -> Xử lý bình thường (401 do sai mật khẩu)
  for (let i = 1; i <= 5; i++) {
    const r = await call('POST', '/auth/login', { email: 'brute@test.com', password: 'wrong' }, null, testHeaders);
    ok(r.s === 401, `Lần thử ${i}: Dưới ngưỡng giới hạn -> Xử lý bình thường (401 Unauthorized)`);
  }

  // Request thứ 6 vượt ngưỡng giới hạn -> Phải nhận HTTP 429 Too Many Requests
  const throttled = await call('POST', '/auth/login', { email: 'brute@test.com', password: 'wrong' }, null, testHeaders);
  ok(throttled.s === 429, 'Vượt ngưỡng giới hạn -> Nhận HTTP 429 Too Many Requests');
  ok(throttled.d.message && throttled.d.message.includes('quá nhiều lần'), 'Trả về thông báo lỗi thân thiện tiếng Việt');
  ok(!!throttled.headers.get('retry-after'), 'Trả về header Retry-After hợp lệ');

  // Xác minh các endpoint khác KHÔNG bị ảnh hưởng ngoài ý muốn
  const publicShopCheck = await call('GET', '/auth/shops');
  ok(publicShopCheck.s === 200, 'Endpoint công khai /auth/shops vẫn hoạt động bình thường');

  const healthCheck = await call('GET', '/health');
  ok(healthCheck.s === 200, 'Endpoint /health vẫn phản hồi 200 bình thường');

  console.log(`\n========================================`);
  console.log(`Tổng kết: ${pass} kiểm tra ĐẠT, ${fails.length} THẤT BẠI`);
  console.log(`========================================\n`);

  if (fails.length > 0) {
    process.exit(1);
  }
} catch (err) {
  console.error('Lỗi ngoại lệ trong quá trình kiểm thử:', err);
  process.exit(1);
} finally {
  server.close();
  try {
    await mongoose.connection.db.dropDatabase();
  } catch {}
  await mongoose.disconnect();
}
