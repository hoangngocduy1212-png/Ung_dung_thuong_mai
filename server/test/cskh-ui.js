import { chromium } from 'playwright';
import { expect } from 'playwright/test';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import { createServer } from 'node:http';
import { readFile, mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, extname, join, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'cskh-browser-test-only';
const frontend = fileURLToPath(new URL('../../frontend/', import.meta.url));
const output = process.env.CSKH_TEST_OUTPUT_DIR || await mkdtemp(join(tmpdir(), 'cskh-ui-'));
await mkdir(output, { recursive: true });
let apiBase;
// Phục vụ frontend thật; chỉ thay URL API sang cổng ngẫu nhiên của DB test.
const staticServer = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://local').pathname);
    const path = resolve(frontend, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!path.startsWith(resolve(frontend) + sep)) { res.writeHead(403); res.end(); return; }
    let content = await readFile(path);
    if (pathname === '/js/config.js') content = Buffer.from(content.toString().replace(/export const API_BASE_URL = [^;]+;/, `export const API_BASE_URL = ${JSON.stringify(apiBase)};`));
    const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' }); res.end(content);
  } catch { res.writeHead(404); res.end(); }
});
// MongoDB chọn cổng trước HTTP để tránh xung đột chọn cổng IPv4/IPv6 trên macOS.
const mongo = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongo.getUri('cskh_test');
await new Promise(resolve => staticServer.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${staticServer.address().port}`;
process.env.CLIENT_ORIGIN = origin;
const { default: mongoose } = await import('mongoose');
const { default: app } = await import('../src/app.js');
const { connectDB } = await import('../src/db.js');
const { signToken } = await import('../src/middleware/auth.js');
const { Complaint, Review } = await import('../src/models/Support.js');
const { default: Order } = await import('../src/models/Order.js');
const { Product } = await import('../src/models/Product.js');
const { createCskhFixtures } = await import('./cskh-fixtures.js');
const results = [], pageErrors = [];
let server, browser, page, f;
const check = (value, message) => { if (!value) throw new Error(message); };
const ready = p => p.locator('.staff-results[aria-busy="false"]').waitFor();
async function search(p, q) { await p.locator('#staff-search').fill(q); await p.getByRole('button', { name: 'Tìm kiếm', exact: true }).click(); await ready(p); }
async function login(p, email = 'cskh@demo.local', channel = 'staff', remember = false) {
  await p.goto(`${origin}/auth.html?tab=${channel}&view=login`);
  await p.locator('#login-form [name=email]').fill(email);
  await p.locator('#login-form [name=password]').fill('Demo@123');
  if (remember) await p.locator('#login-form [name=remember]').check();
  await p.locator('#login-form button[type=submit]').click();
  await p.waitForURL(channel === 'staff' ? '**/staff.html' : '**/index.html');
}
async function openComplaint(p, complaint) {
  await p.goto(`${origin}/staff.html?section=complaints&id=${complaint._id}`);
  await p.getByRole('heading', { name: 'Nội dung khiếu nại', exact: true }).waitFor();
}
async function api(method, path, token = signToken(f.staff), body) {
  const response = await fetch(apiBase + path, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: response.status, data: await response.json() };
}
async function test(name, run) {
  try { await run(); results.push({ name, passed: true }); console.log('PASS:', name); }
  catch (error) {
    const screenshot = join(output, `failure-${results.length + 1}.png`);
    await page?.screenshot({ path: screenshot, fullPage: true }).catch(() => {});
    results.push({ name, passed: false, error: error.message, screenshot }); console.error('FAIL:', name, error.message);
  }
}
async function newPage() { const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } }); const p = await context.newPage(); p.on('pageerror', error => pageErrors.push(error.message)); return p; }

try {
  await connectDB(); f = await createCskhFixtures();
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.listening ? resolve() : server.once('listening', resolve));
  apiBase = `http://127.0.0.1:${server.address().port}/api`;
  const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const executablePath = process.env.CSKH_BROWSER_PATH || (process.platform === 'darwin' && existsSync(chrome) ? chrome : undefined);
  browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  page = await newPage();

  await test('Đăng nhập, mật khẩu sai, ghi nhớ phiên và chặn khách chưa đăng nhập', async () => {
    await page.goto(`${origin}/staff.html`); await page.waitForURL('**/auth.html?tab=staff&view=login');
    await page.locator('#login-form [name=email]').fill('cskh@demo.local');
    await page.locator('#login-form [name=password]').fill('wrong');
    await page.locator('#login-form button[type=submit]').click();
    await expect(page.locator('#login-form')).toContainText('Email hoặc mật khẩu không đúng');
    await login(page, 'cskh@demo.local', 'staff', true); await ready(page);
    check(await page.evaluate(() => !!localStorage.getItem('techstore.token') && !sessionStorage.getItem('techstore.token')), 'Phiên ghi nhớ phải nằm trong localStorage');
    const tab = await page.context().newPage(); await tab.goto(`${origin}/auth.html?tab=staff&view=login`); await tab.waitForURL('**/staff.html'); await tab.close();
  });
  await test('Phân trang, tìm khiếu nại, tải lại URL và quay lại danh sách', async () => {
    await page.goto(`${origin}/staff.html?section=complaints&q=KN_DEMO_`); await ready(page);
    await expect(page.getByText('1–10 / 13 kết quả', { exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Sau →', exact: true }).click(); await ready(page);
    await expect(page.getByText('11–13 / 13 kết quả', { exact: true })).toBeVisible();
    await page.reload(); await ready(page); await expect(page.locator('#staff-search')).toHaveValue('KN_DEMO_');
    await search(page, 'KN_DEMO_001'); await page.getByRole('link', { name: 'Xem khiếu nại', exact: true }).click();
    await page.getByRole('heading', { name: 'Nội dung khiếu nại', exact: true }).waitFor();
    await page.getByRole('link', { name: '← Quay lại danh sách', exact: true }).click(); await ready(page);
    await expect(page.locator('#staff-search')).toHaveValue('KN_DEMO_001');
  });
  await test('Tra cứu khách theo tên/email/SĐT, chi tiết khách và đơn liên quan', async () => {
    await page.goto(`${origin}/staff.html?section=customers`); await ready(page);
    for (const q of ['LÊ THU', 'khach@demo.local', '0901000004']) { await search(page, q); await expect(page.getByText('1–1 / 1 kết quả', { exact: true })).toBeVisible(); }
    await page.getByRole('link', { name: 'Xem khách hàng', exact: true }).click();
    await page.getByRole('heading', { name: 'Thông tin khách hàng', exact: true }).waitFor();
    await expect(page.getByText('12 Nguyễn Huệ, Bến Nghé, Quận 1, TP. Hồ Chí Minh', { exact: true })).toBeVisible();
    await page.getByRole('link', { name: f.orders[0].code, exact: true }).click();
    await page.getByRole('heading', { name: 'Sản phẩm trong đơn', exact: true }).waitFor();
    await expect(page.getByText('6.520.000đ', { exact: true }).first()).toBeVisible();
  });
  await test('Tra cứu đơn theo mã đơn/mã nhóm/khách và lọc trạng thái', async () => {
    await page.goto(`${origin}/staff.html?section=orders`); await ready(page);
    for (const q of [f.orders[0].code, f.orders[0].groupCode, f.customer.email]) { await search(page, q); await expect(page.getByText('1–1 / 1 kết quả', { exact: true })).toBeVisible(); }
    await page.getByLabel('Trạng thái', { exact: true }).selectOption('da_huy'); await page.getByRole('button', { name: 'Tìm kiếm', exact: true }).click(); await ready(page);
    await expect(page.getByRole('heading', { name: 'Chưa có kết quả', exact: true })).toBeVisible();
  });
  await test('Chuỗi HTML hiển thị an toàn, phản hồi trắng bị chặn, bấm lặp chỉ gửi một lần', async () => {
    const c = await f.makeComplaint('KN_UI_SAFE', { reason: '<img src=x onerror="window.cskhXss=1"> Nội dung cần hỗ trợ' });
    await openComplaint(page, c); const field = page.locator('#complaint-message');
    await field.fill('   '); await page.getByRole('button', { name: 'Nhận xử lý & phản hồi', exact: true }).click();
    check(!(await Complaint.findById(c._id)).assignedTo, 'Phản hồi trắng không được nhận đơn');
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    check(await field.getAttribute('maxlength') === '2000', 'Giới hạn 2000 ký tự');
    await expect(page.locator('#workspace img, #workspace script')).toHaveCount(0);
    check(await page.evaluate(() => window.cskhXss) === undefined, 'Không chạy HTML từ nội dung khách');
    await field.fill('<script>window.cskhXss=1</script>\nĐã tiếp nhận');
    let release, intercepted; const gate = new Promise(r => release = r), arrived = new Promise(r => intercepted = r); let sends = 0;
    await page.route('**/complaints/*/respond', async route => { sends++; intercepted(); await gate; await route.continue(); });
    await page.getByRole('button', { name: 'Nhận xử lý & phản hồi', exact: true }).dblclick(); await arrived;
    await expect(page.locator('.staff-action-form button[type=submit]')).toBeDisabled(); await expect(field).toHaveAttribute('readonly', '');
    const sent = page.waitForResponse(r => r.url().endsWith(`/complaints/${c._id}/respond`));
    release(); await sent; await page.getByRole('button', { name: 'Gửi phản hồi', exact: true }).waitFor(); await page.unroute('**/complaints/*/respond');
    check(sends === 1 && (await Complaint.findById(c._id)).responses.length === 1, 'Không gửi trùng phản hồi');
    await expect(page.locator('#workspace script')).toHaveCount(0);
  });
  await test('Xác nhận hoàn tất: hủy/Escape giữ nháp, xác nhận lưu lịch sử và khóa thao tác', async () => {
    const c = await f.makeComplaint('KN_UI_RESOLVE'); await openComplaint(page, c);
    await page.getByLabel('Thao tác', { exact: true }).selectOption('resolve');
    await page.locator('#complaint-message').fill('Đã gửi bù phụ kiện.');
    await page.getByRole('button', { name: 'Hoàn tất khiếu nại', exact: true }).click();
    await page.getByRole('dialog').waitFor(); await page.keyboard.press('Tab');
    check(await page.getByRole('dialog').evaluate(el => el.contains(document.activeElement)), 'Focus phải ở trong hộp thoại');
    await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
    check((await Complaint.findById(c._id)).status === 'moi', 'Hủy không ghi thay đổi');
    await expect(page.locator('#complaint-message')).toHaveValue('Đã gửi bù phụ kiện.');
    await page.getByRole('button', { name: 'Hoàn tất khiếu nại', exact: true }).click(); await page.getByRole('button', { name: 'Xác nhận', exact: true }).click();
    await page.getByRole('heading', { name: 'Khiếu nại đã hoàn tất', exact: true }).waitFor(); await expect(page.locator('#complaint-action')).toHaveCount(0);
    await page.getByRole('link', { name: '← Quay lại danh sách', exact: true }).click(); await ready(page); await search(page, c.code);
    await expect(page.getByText('1–1 / 1 kết quả', { exact: true })).toBeVisible();
  });
  await test('Khách gửi khiếu nại → CSKH phản hồi/chuyển admin → admin hoàn tiền → khách và CSKH thấy kết quả', async () => {
    const orderData = f.orders[0].toObject(); delete orderData._id; delete orderData.__v;
    const order = await Order.create({ ...orderData, code: 'DH_UI_REFUND', groupCode: 'NHOM_UI_REFUND' });
    const customer = await newPage(); await login(customer, 'khach@demo.local', 'customer');
    await customer.goto(`${origin}/account.html?section=complaints&orderCode=${order.code}`);
    await customer.locator('textarea[name=reason]').fill('UI_E2E: Sản phẩm lỗi, đề nghị kiểm tra và hỗ trợ hoàn tiền.');
    const createdPromise = customer.waitForResponse(r => r.url().endsWith('/customer/complaints') && r.request().method() === 'POST');
    await customer.getByRole('button', { name: 'Gửi khiếu nại', exact: true }).click();
    const createdResponse = await createdPromise; check(createdResponse.status() === 201, 'Khách tạo khiếu nại'); const c = await createdResponse.json();
    await openComplaint(page, c); await page.locator('#complaint-message').fill('CSKH đã tiếp nhận và đang kiểm tra đơn.');
    await page.getByRole('button', { name: 'Nhận xử lý & phản hồi', exact: true }).click(); await page.getByRole('button', { name: 'Gửi phản hồi', exact: true }).waitFor();
    await customer.reload(); const card = customer.locator('.account-record').filter({ hasText: c.code }); await card.getByRole('button', { name: 'Xem phản hồi', exact: true }).click();
    await expect(customer.getByRole('dialog')).toContainText('CSKH đã tiếp nhận và đang kiểm tra đơn.'); await customer.keyboard.press('Escape');
    await page.getByLabel('Thao tác', { exact: true }).selectOption('escalate'); await page.locator('#complaint-message').fill('Cần admin quyết định hoàn tiền.');
    await page.getByRole('button', { name: 'Chuyển quản trị viên', exact: true }).click(); await page.getByRole('button', { name: 'Xác nhận', exact: true }).click();
    await page.getByRole('heading', { name: 'Đang chờ quản trị viên', exact: true }).waitFor(); await expect(page.locator('#complaint-action')).toHaveCount(0);
    const queue = await api('GET', '/admin/complaints', signToken(f.admin)); check(queue.data.items.some(item => item._id === c._id), 'Admin nhận đúng khiếu nại');
    const result = await api('POST', `/admin/complaints/${c._id}/resolve`, signToken(f.admin), { result: 'Đã quyết định hoàn tiền cho khách.', forceRefund: true }); check(result.status === 200, 'Admin xử lý hoàn tiền');
    const refunded = await Order.findById(order._id); check(refunded.status === 'da_tra_hang' && refunded.payment.status === 'refunded', 'Đơn được hoàn tiền đúng');
    await page.reload(); await expect(page.getByText('Đã quyết định hoàn tiền cho khách.', { exact: true })).toBeVisible();
    await page.goto(`${origin}/staff.html?section=history&q=${c.code}`); await ready(page); await expect(page.getByText('1–1 / 1 kết quả', { exact: true })).toBeVisible();
    await customer.reload(); await customer.locator('.account-record').filter({ hasText: c.code }).getByRole('button', { name: 'Xem phản hồi', exact: true }).click();
    await expect(customer.getByRole('dialog')).toContainText('Đã quyết định hoàn tiền cho khách.'); await customer.context().close();
  });
  await test('Hai nhân viên mở cùng đơn: chặn người đến sau và giữ nội dung nháp', async () => {
    const c = await f.makeComplaint('KN_UI_OWNERSHIP'); const second = await newPage(); await login(second, 'cskh2@demo.local');
    await openComplaint(page, c); await openComplaint(second, c);
    await page.locator('#complaint-message').fill('Nhân viên đầu tiên nhận đơn.'); await second.locator('#complaint-message').fill('Bản nháp cần giữ lại.');
    await page.getByRole('button', { name: 'Nhận xử lý & phản hồi', exact: true }).click(); await page.getByRole('button', { name: 'Gửi phản hồi', exact: true }).waitFor();
    await second.getByRole('button', { name: 'Nhận xử lý & phản hồi', exact: true }).click();
    await expect(second.locator('#complaint-error')).toHaveText('Đơn này đang do nhân viên khác phụ trách'); await expect(second.locator('#complaint-message')).toHaveValue('Bản nháp cần giữ lại.');
    await second.getByRole('button', { name: 'Tải lại trạng thái', exact: true }).click(); await second.getByRole('heading', { name: 'Không tải được dữ liệu', exact: true }).waitFor(); await second.context().close();
  });
  await test('Đánh giá: lọc tên/sao/sản phẩm, hủy xóa, xóa trang cuối tự điều chỉnh phân trang', async () => {
    const product = await Product.create({ name: 'Sản phẩm kiểm thử UI riêng', shop: f.shop._id, category: f.product.category });
    await Review.create(Array.from({ length: 11 }, (_, i) => ({ order: f.objectId(), product: product._id, shop: f.shop._id, customer: f.customer._id, rating: i % 5 + 1, content: `UI review ${i}` })));
    await page.goto(`${origin}/staff.html?section=reviews&product=${product._id}&page=2`); await ready(page);
    await expect(page.locator('.staff-review')).toHaveCount(1); await page.getByRole('button', { name: 'Xóa đánh giá', exact: true }).click(); await page.getByRole('button', { name: 'Giữ đánh giá', exact: true }).click();
    check(await Review.countDocuments({ product: product._id, isDeleted: false }) === 11, 'Hủy xóa giữ đánh giá');
    await page.getByRole('button', { name: 'Xóa đánh giá', exact: true }).click(); await page.getByRole('button', { name: 'Xác nhận xóa', exact: true }).click();
    await expect(page.getByText('1–10 / 10 kết quả', { exact: true })).toBeVisible(); check(new URL(page.url()).searchParams.get('page') === '1', 'Tự trở về trang hợp lệ');
    await page.getByLabel('Số sao', { exact: true }).selectOption('2'); await search(page, product.name);
    await expect(page.locator('.staff-review')).toHaveCount(await Review.countDocuments({ product: product._id, isDeleted: false, rating: 2 }));
    check((await Product.findById(product._id)).ratingCount === 10, 'Điểm sản phẩm được tính lại');
  });
  await test('Lỗi mạng/500: danh sách có thông báo và thử lại được', async () => {
    for (const mode of ['offline', '500']) {
      await page.route('**/api/staff/orders*', route => mode === 'offline' ? route.abort('failed') : route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Lỗi kiểm thử có chủ đích' }) }));
      await page.goto(`${origin}/staff.html?section=orders`); await page.getByRole('heading', { name: 'Không tải được dữ liệu', exact: true }).waitFor();
      await page.unroute('**/api/staff/orders*'); await page.getByRole('button', { name: 'Thử lại', exact: true }).click(); await ready(page); await expect(page.locator('.staff-error')).toHaveCount(0);
    }
  });
  await test('Lỗi gửi giữ nháp; đổi trang khi đang gửi không bị kéo về trang cũ', async () => {
    const c = await f.makeComplaint('KN_UI_INFLIGHT'); await openComplaint(page, c);
    await page.locator('#complaint-message').fill('Nội dung không được mất khi máy chủ lỗi.');
    await page.route('**/complaints/*/respond', route => route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Lỗi tạm thời"}' }));
    await page.getByRole('button', { name: 'Nhận xử lý & phản hồi', exact: true }).click(); await expect(page.locator('#complaint-error')).toHaveText('Lỗi tạm thời'); await expect(page.locator('#complaint-message')).toHaveValue('Nội dung không được mất khi máy chủ lỗi.');
    await page.unroute('**/complaints/*/respond');
    let release, intercepted; const gate = new Promise(r => release = r), arrived = new Promise(r => intercepted = r);
    await page.route('**/complaints/*/respond', async route => { intercepted(); await gate; await route.continue(); });
    await page.getByRole('button', { name: 'Nhận xử lý & phản hồi', exact: true }).click(); await arrived;
    await page.getByRole('link', { name: 'Khách hàng', exact: true }).click(); await ready(page);
    const sent = page.waitForResponse(r => r.url().endsWith(`/complaints/${c._id}/respond`)); release(); await sent; await page.getByText('Đã gửi phản hồi cho khách hàng.', { exact: true }).waitFor(); await page.unroute('**/complaints/*/respond');
    await expect(page).toHaveURL(/section=customers/); await expect(page.getByRole('heading', { name: 'Khách hàng', exact: true })).toBeVisible();
    check((await Complaint.findById(c._id)).responses.length === 1, 'Yêu cầu gửi nền vẫn hoàn tất');
  });
  await test('ID sai hoặc không tồn tại: hiện lỗi và có đường quay lại', async () => {
    for (const id of ['invalid-id', String(f.objectId())]) {
      await page.goto(`${origin}/staff.html?section=complaints&id=${id}`); await page.getByRole('heading', { name: 'Không tải được dữ liệu', exact: true }).waitFor();
      await page.getByRole('link', { name: 'Quay lại danh sách', exact: true }).click(); await ready(page);
    }
  });
  await test('Chặn sai vai trò và tài khoản đang dùng bị khóa', async () => {
    const customer = await newPage(); await login(customer, 'khach@demo.local', 'customer'); let calls = 0;
    customer.on('request', req => { if (req.url().includes('/api/staff/')) calls++; }); await customer.goto(`${origin}/staff.html`);
    await customer.getByRole('heading', { name: 'Khu vực dành cho nhân viên CSKH', exact: true }).waitFor(); check(calls === 0, 'Không gọi API nhân viên bằng tài khoản khách'); await customer.context().close();
    const staff2 = await newPage(); await login(staff2, 'cskh2@demo.local'); await ready(staff2); f.otherStaff.status = 'locked'; await f.otherStaff.save();
    await staff2.getByRole('link', { name: 'Đơn hàng', exact: true }).click(); await staff2.waitForURL('**/auth.html?tab=staff&view=login');
    check(await staff2.evaluate(() => !localStorage.getItem('techstore.token') && !sessionStorage.getItem('techstore.token')), 'Xóa phiên khi bị khóa');
    f.otherStaff.status = 'active'; await f.otherStaff.save(); await staff2.context().close();
  });
  await test('Phiên hết hạn bị xóa và chuyển đúng về đăng nhập CSKH', async () => {
    const expired = await newPage();
    const token = jwt.sign({ id: f.staff._id }, process.env.JWT_SECRET, { expiresIn: -1 });
    await expired.context().addInitScript(value => localStorage.setItem('techstore.token', value), token);
    await expired.goto(`${origin}/staff.html`); await expired.waitForURL('**/auth.html?tab=staff&view=login');
    // addInitScript chỉ dùng thiết lập ban đầu; phiên hết hạn không được sử dụng vào API staff.
    await expect(expired.locator('#login-form')).toBeVisible();
    await expect.poll(() => expired.evaluate(() => !localStorage.getItem('techstore.token') && !sessionStorage.getItem('techstore.token'))).toBe(true);
    await expired.context().close();
  });
  await test('Responsive, menu tài khoản và ảnh kiểm tra desktop/mobile', async () => {
    await page.goto(`${origin}/staff.html?section=complaints`); await ready(page);
    for (const width of [375, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForFunction(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      await expect(page.locator('#shopping-chrome .account-link__icon svg')).toBeVisible();
    }
    await page.screenshot({ path: join(output, 'desktop.png'), fullPage: false });
    await page.setViewportSize({ width: 375, height: 812 }); await page.screenshot({ path: join(output, 'mobile.png'), fullPage: false });
    await page.locator('#shopping-chrome .account-trigger').click(); await expect(page.getByRole('menuitem', { name: 'Đăng xuất', exact: true })).toBeVisible();
    await page.keyboard.press('Escape'); await expect(page.locator('#shopping-account-menu')).toBeHidden();
  });
  await test('Đăng xuất xóa cả hai nơi lưu phiên và chặn truy cập lại', async () => {
    await page.locator('#shopping-chrome .account-trigger').click(); await page.getByRole('menuitem', { name: 'Đăng xuất', exact: true }).click();
    await page.waitForURL('**/auth.html?tab=staff&view=login');
    check(await page.evaluate(() => !localStorage.getItem('techstore.token') && !sessionStorage.getItem('techstore.token')), 'Token đã được xóa');
    await page.goto(`${origin}/staff.html`); await page.waitForURL('**/auth.html?tab=staff&view=login');
  });
  if (pageErrors.length) results.push({ name: 'Không có lỗi JavaScript', passed: false, errors: pageErrors });
  const report = { suite: 'CSKH trên trình duyệt', passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length, pageErrors, results, output };
  await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2));
  if (report.failed) process.exitCode = 1;
} finally {
  await browser?.close();
  if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
  staticServer.closeAllConnections(); await new Promise(resolve => staticServer.close(resolve));
  await mongoose.disconnect(); await mongo.stop();
}
