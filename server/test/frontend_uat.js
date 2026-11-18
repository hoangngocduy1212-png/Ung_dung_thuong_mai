import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = path.resolve('..', 'screenshots', 'uat');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const BASE_URL = 'http://localhost:5173';

async function runFrontendUat() {
  console.log('=====================================================');
  console.log('   TECHSTORE FRONTEND BROWSER UAT WITH PLAYWRIGHT    ');
  console.log('=====================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push({ url: page.url(), text: msg.text() });
    }
  });

  page.on('response', (res) => {
    if (res.status() >= 400 && !res.url().includes('favicon')) {
      networkErrors.push({ url: res.url(), status: res.status() });
    }
  });

  const testScreens = [];

  async function testView(name, url, screenshotName, actionBeforeShot) {
    try {
      console.log(`\nTesting: [${name}] -> ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      if (actionBeforeShot) {
        await actionBeforeShot(page);
      }
      await page.waitForTimeout(1000);
      const filePath = path.join(SCREENSHOT_DIR, screenshotName);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`[PASS] Captured: ${screenshotName}`);
      testScreens.push({ name, url, status: 'PASS', screenshot: screenshotName });
    } catch (err) {
      console.error(`[FAIL] Error on ${name}:`, err.message);
      testScreens.push({ name, url, status: 'FAIL', error: err.message });
    }
  }

  // --- 1. Public Storefront Pages ---
  await testView('Trang chủ (Home)', `${BASE_URL}/`, '01_storefront_home.png');
  await testView('Danh sách sản phẩm (Products)', `${BASE_URL}/products`, '02_storefront_products.png');
  await testView('Chi tiết sản phẩm (Product Detail)', `${BASE_URL}/products/6af5e892d900d59fc1cc283d`, '03_storefront_product_detail.png');
  await testView('Danh mục sản phẩm (Categories)', `${BASE_URL}/categories`, '04_storefront_categories.png');
  await testView('So sánh sản phẩm (Compare)', `${BASE_URL}/compare`, '05_storefront_compare.png');
  await testView('Khuyến mãi (Promotions)', `${BASE_URL}/promotions`, '06_storefront_promotions.png');
  await testView('Giỏ hàng (Cart)', `${BASE_URL}/cart`, '07_storefront_cart.png');

  // --- 2. Auth Pages ---
  await testView('Đăng nhập (Login)', `${BASE_URL}/login`, '08_auth_login.png');
  await testView('Đăng ký (Register)', `${BASE_URL}/register`, '09_auth_register.png');

  // --- 3. Customer Flow (Login -> Account Overview -> Wishlist -> Orders) ---
  console.log('\n--- CUSTOMER LOGIN & ACCOUNT PORTAL ---');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'khach@shop.local');
  await page.fill('input[type="password"]', 'Khach@123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  await testView('Khách hàng - Tổng quan (Account Overview)', `${BASE_URL}/account`, '10_customer_account.png');
  await testView('Khách hàng - Đơn hàng (Order History)', `${BASE_URL}/account/orders`, '11_customer_orders.png');
  await testView('Khách hàng - Yêu thích (Wishlist)', `${BASE_URL}/account/wishlist`, '12_customer_wishlist.png');
  await testView('Khách hàng - Đặt hàng (Checkout)', `${BASE_URL}/checkout`, '13_customer_checkout.png');

  // Logout customer
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // --- 4. Seller Flow (Login -> Seller Dashboard -> Products -> Orders -> After-sales) ---
  console.log('\n--- SELLER LOGIN & STUDIO ---');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'owner@shop.local');
  await page.fill('input[type="password"]', 'Owner@123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  await testView('Seller - Bảng điều khiển (Dashboard)', `${BASE_URL}/seller`, '14_seller_dashboard.png');
  await testView('Seller - Quản lý sản phẩm (Products)', `${BASE_URL}/seller/products`, '15_seller_products.png');
  await testView('Seller - Đơn hàng (Orders)', `${BASE_URL}/seller/orders`, '16_seller_orders.png');
  await testView('Seller - Hậu mãi (After-Sales)', `${BASE_URL}/seller/after-sales`, '17_seller_aftersales.png');

  // Logout seller
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // --- 5. Admin Flow (Login -> Admin Dashboard -> Shops -> Users -> Categories -> Complaints) ---
  console.log('\n--- ADMIN LOGIN & PORTAL ---');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@shop.local');
  await page.fill('input[type="password"]', 'Admin@123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  await testView('Admin - Bảng điều khiển (Dashboard)', `${BASE_URL}/admin`, '18_admin_dashboard.png');
  await testView('Admin - Quản lý Gian hàng (Shops)', `${BASE_URL}/admin/shops`, '19_admin_shops.png');
  await testView('Admin - Quản lý Người dùng (Users)', `${BASE_URL}/admin/users`, '20_admin_users.png');
  await testView('Admin - Quản lý Danh mục (Categories)', `${BASE_URL}/admin/categories`, '21_admin_categories.png');
  await testView('Admin - Quản lý Thương hiệu (Brands)', `${BASE_URL}/admin/brands`, '22_admin_brands.png');
  await testView('Admin - Quản lý Sản phẩm (Products)', `${BASE_URL}/admin/products`, '23_admin_products.png');
  await testView('Admin - Khiếu nại (Complaints)', `${BASE_URL}/admin/complaints`, '24_admin_complaints.png');

  await browser.close();

  console.log('\n=====================================================');
  console.log(`TỔNG KẾT BROWSER UAT: ${testScreens.filter(s => s.status === 'PASS').length}/${testScreens.length} SCREENS CAPTURED`);
  console.log(`Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Sample Console Errors:', consoleErrors.slice(0, 5));
  }
  console.log(`Network Errors: ${networkErrors.length}`);
  if (networkErrors.length > 0) {
    console.log('Sample Network Errors:', networkErrors.slice(0, 5));
  }
  console.log('=====================================================');
}

runFrontendUat();
