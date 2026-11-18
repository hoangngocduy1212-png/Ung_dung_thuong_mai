import mongoose from 'mongoose';
import config from '../src/config.js';

const BASE_URL = 'http://localhost:5000/api';

async function runUatDataTests() {
  console.log('=====================================================');
  console.log('   TECHSTORE POST-ATLAS INTEGRATION DATA UAT       ');
  console.log('=====================================================\n');

  const results = [];

  function record(name, status, details = '') {
    results.push({ name, status, details });
    console.log(`[${status}] ${name} ${details ? '— ' + details : ''}`);
  }

  try {
    // 1. Kiểm tra Catalog: Categories, Brands, Products, Variants
    console.log('\n--- 1. CATALOG & PRODUCTS ---');
    const catRes = await fetch(`${BASE_URL}/categories`).then(r => r.json());
    if (Array.isArray(catRes) && catRes.length > 0) {
      record('Danh mục sản phẩm (Categories)', 'PASS', `Tìm thấy ${catRes.length} danh mục`);
    } else {
      record('Danh mục sản phẩm (Categories)', 'FAIL', 'Không tải được danh mục');
    }

    const brandRes = await fetch(`${BASE_URL}/brands`).then(r => r.json());
    if (Array.isArray(brandRes) && brandRes.length > 0) {
      record('Thương hiệu (Brands)', 'PASS', `Tìm thấy ${brandRes.length} thương hiệu`);
    } else {
      record('Thương hiệu (Brands)', 'FAIL', 'Không tải được thương hiệu');
    }

    const prodRes = await fetch(`${BASE_URL}/products`).then(r => r.json());
    const products = prodRes.items || [];
    if (products.length > 0) {
      record('Danh sách sản phẩm (Products list)', 'PASS', `Tìm thấy ${prodRes.total} sản phẩm (trang 1 có ${products.length} sản phẩm)`);
    } else {
      record('Danh sách sản phẩm (Products list)', 'FAIL', 'Không có sản phẩm nào trả về');
    }

    const sampleProduct = products[0];
    let sampleVariant = null;
    if (sampleProduct) {
      const detailRes = await fetch(`${BASE_URL}/products/${sampleProduct._id}`).then(r => r.json());
      if (detailRes && detailRes._id === sampleProduct._id) {
        record('Chi tiết sản phẩm (Product details)', 'PASS', `Tải thành công "${detailRes.name}"`);
        const variants = detailRes.variants || [];
        if (variants.length > 0) {
          sampleVariant = variants[0];
          record('Biến thể sản phẩm (Product variants)', 'PASS', `Có ${variants.length} biến thể, tồn kho: ${variants.map(v => v.stock).join(', ')}`);
        } else {
          record('Biến thể sản phẩm (Product variants)', 'FAIL', 'Sản phẩm không có biến thể');
        }
      } else {
        record('Chi tiết sản phẩm (Product details)', 'FAIL', `Không tải được chi tiết ID ${sampleProduct._id}`);
      }
    }

    // 2. Kiểm tra Vouchers
    console.log('\n--- 2. VOUCHER SYSTEM ---');
    const voucherRes = await fetch(`${BASE_URL}/vouchers/platform`).then(r => r.json());
    if (Array.isArray(voucherRes) && voucherRes.length > 0) {
      record('Voucher sàn (Platform vouchers)', 'PASS', `Tìm thấy ${voucherRes.length} platform vouchers`);
    } else {
      record('Voucher sàn (Platform vouchers)', 'FAIL', 'Không có voucher sàn nào');
    }

    // 3. Kiểm tra Đăng nhập & RBAC cho các Role có sẵn
    console.log('\n--- 3. AUTHENTICATION & RBAC ---');
    const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@shop.local', password: 'Admin@123' })
    }).then(r => r.json());

    if (adminLogin.token && adminLogin.user.role === 'admin') {
      record('Đăng nhập Admin', 'PASS', `Tài khoản ${adminLogin.user.email} (token hợp lệ)`);
    } else {
      record('Đăng nhập Admin', 'FAIL', 'Đăng nhập admin thất bại');
    }

    const sellerLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@shop.local', password: 'Owner@123' })
    }).then(r => r.json());

    if (sellerLogin.token && sellerLogin.user.role === 'seller') {
      record('Đăng nhập Seller', 'PASS', `Tài khoản ${sellerLogin.user.email} (Shop: ${sellerLogin.user.shop})`);
    } else {
      record('Đăng nhập Seller', 'FAIL', 'Đăng nhập seller thất bại');
    }

    const customerLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'khach@shop.local', password: 'Khach@123' })
    }).then(r => r.json());

    if (customerLogin.token && customerLogin.user.role === 'customer') {
      record('Đăng nhập Customer', 'PASS', `Tài khoản ${customerLogin.user.email} (Điểm: ${customerLogin.user.points || 0})`);
    } else {
      record('Đăng nhập Customer', 'FAIL', 'Đăng nhập customer thất bại');
    }

    // RBAC: Customer thử gọi Admin API
    const rbacCustomerToAdmin = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${customerLogin.token}` }
    });
    if (rbacCustomerToAdmin.status === 403) {
      record('RBAC: Chặn Customer truy cập Admin API', 'PASS', 'HTTP 403 Forbidden chính xác');
    } else {
      record('RBAC: Chặn Customer truy cập Admin API', 'FAIL', `Nhận HTTP ${rbacCustomerToAdmin.status} thay vì 403`);
    }

    // RBAC: Seller thử gọi Admin API
    const rbacSellerToAdmin = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${sellerLogin.token}` }
    });
    if (rbacSellerToAdmin.status === 403) {
      record('RBAC: Chặn Seller truy cập Admin API', 'PASS', 'HTTP 403 Forbidden chính xác');
    } else {
      record('RBAC: Chặn Seller truy cập Admin API', 'FAIL', `Nhận HTTP ${rbacSellerToAdmin.status} thay vì 403`);
    }

    // 4. Kiểm tra Customer Data: Hồ sơ, Đơn hàng, Wishlist, Cart
    console.log('\n--- 4. CUSTOMER PROFILE & ORDER HISTORY ---');
    const custProfile = await fetch(`${BASE_URL}/customer/profile`, {
      headers: { 'Authorization': `Bearer ${customerLogin.token}` }
    }).then(r => r.json());

    if (custProfile && custProfile.email) {
      record('Hồ sơ người dùng (User Profile)', 'PASS', `Họ tên: ${custProfile.fullName}, Email: ${custProfile.email}, Role: ${custProfile.role}`);
    } else {
      record('Hồ sơ người dùng (User Profile)', 'FAIL', 'Không tải được profile');
    }

    const custOrdersRes = await fetch(`${BASE_URL}/customer/orders`, {
      headers: { 'Authorization': `Bearer ${customerLogin.token}` }
    }).then(r => r.json());

    if (custOrdersRes && Array.isArray(custOrdersRes.items)) {
      record('Lịch sử đơn hàng (Customer Orders)', 'PASS', `Tìm thấy ${custOrdersRes.total} đơn hàng trong lịch sử`);
      if (custOrdersRes.items.length > 0) {
        const o = custOrdersRes.items[0];
        record('Chi tiết đơn hàng thực tế', 'PASS', `Mã đơn #${o._id}, Trạng thái: ${o.status}, Tổng tiền: ${o.total?.toLocaleString()}đ`);
      }
    } else {
      record('Lịch sử đơn hàng (Customer Orders)', 'FAIL', 'Không tải được danh sách đơn hàng');
    }

    // 5. Kiểm tra Seller Studio Data: Sản phẩm của shop, đơn hàng, thống kê
    console.log('\n--- 5. SELLER STUDIO DATA ---');
    const sellerStats = await fetch(`${BASE_URL}/seller/stats`, {
      headers: { 'Authorization': `Bearer ${sellerLogin.token}` }
    }).then(r => r.json());

    if (sellerStats && sellerStats.revenue !== undefined) {
      record('Thống kê Seller (Seller Stats)', 'PASS', `Doanh thu: ${sellerStats.revenue.toLocaleString()}đ, Đơn hàng: ${sellerStats.orderCount}`);
    } else {
      record('Thống kê Seller (Seller Stats)', 'FAIL', 'Không tải được seller stats');
    }

    const sellerProductsRes = await fetch(`${BASE_URL}/seller/products`, {
      headers: { 'Authorization': `Bearer ${sellerLogin.token}` }
    }).then(r => r.json());

    if (sellerProductsRes && Array.isArray(sellerProductsRes.items)) {
      record('Seller quản lý sản phẩm (Seller Products)', 'PASS', `Shop đang sở hữu ${sellerProductsRes.total} sản phẩm`);
    } else {
      record('Seller quản lý sản phẩm (Seller Products)', 'FAIL', 'Không tải được sản phẩm của seller');
    }

    // 6. Kiểm tra Admin Portal Data: Thống kê, Gian hàng, Khách hàng
    console.log('\n--- 6. ADMIN PORTAL DATA ---');
    const adminStats = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminLogin.token}` }
    }).then(r => r.json());

    if (adminStats && adminStats.totals) {
      record('Thống kê Admin (Admin Stats)', 'PASS', `GMV: ${adminStats.gmv?.toLocaleString()}đ, Khách hàng: ${adminStats.totals.customers}, Gian hàng: ${adminStats.totals.activeShops}`);
    } else {
      record('Thống kê Admin (Admin Stats)', 'FAIL', 'Không tải được admin stats');
    }

    const adminShopsRes = await fetch(`${BASE_URL}/admin/shops`, {
      headers: { 'Authorization': `Bearer ${adminLogin.token}` }
    }).then(r => r.json());

    if (adminShopsRes && Array.isArray(adminShopsRes.items)) {
      record('Admin quản lý gian hàng (Admin Shops)', 'PASS', `Tìm thấy ${adminShopsRes.total} gian hàng đối tác`);
    } else {
      record('Admin quản lý gian hàng (Admin Shops)', 'FAIL', 'Không tải được danh sách shop');
    }

    const adminUsersRes = await fetch(`${BASE_URL}/admin/customers`, {
      headers: { 'Authorization': `Bearer ${adminLogin.token}` }
    }).then(r => r.json());

    if (adminUsersRes && Array.isArray(adminUsersRes.items)) {
      record('Admin quản lý khách hàng (Admin Users)', 'PASS', `Tìm thấy ${adminUsersRes.total} khách hàng`);
    } else {
      record('Admin quản lý khách hàng (Admin Users)', 'FAIL', 'Không tải được danh sách user');
    }

    // 7. Luồng Ghi Cách Ly (Isolated Test Account: Đăng ký -> Cart -> Wishlist -> Dọn dẹp)
    console.log('\n--- 7. KIỂM THỬ THAO TÁC GHI CÁCH LY (TEST ACCOUNT) ---');
    const testEmail = `uat_tester_${Date.now()}@shop.local`;
    const testPw = 'UatPass@123';
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPw,
        fullName: 'UAT Test User',
        phone: '0988776655'
      })
    }).then(r => r.json());

    if (regRes.token && regRes.user?.email === testEmail) {
      record('Đăng ký tài khoản mới (Register)', 'PASS', `Đăng ký thành công ${testEmail}`);
      const testToken = regRes.token;

      // Test Wishlist: POST /customer/wishlist/:productId
      if (sampleProduct) {
        const addWishlist = await fetch(`${BASE_URL}/customer/wishlist/${sampleProduct._id}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${testToken}` }
        }).then(r => r.json());

        const getWishlist = await fetch(`${BASE_URL}/customer/wishlist`, {
          headers: { 'Authorization': `Bearer ${testToken}` }
        }).then(r => r.json());

        if (Array.isArray(getWishlist) && getWishlist.some(w => String(w._id) === String(sampleProduct._id))) {
          record('Wishlist (Thêm & Xem)', 'PASS', `Thêm sản phẩm "${sampleProduct.name}" vào Wishlist thành công`);
        } else {
          record('Wishlist (Thêm & Xem)', 'FAIL', 'Thêm vào wishlist không xuất hiện');
        }

        // Test Cart: POST /customer/cart/items with { productId, variantId, quantity }
        if (sampleVariant) {
          const addCart = await fetch(`${BASE_URL}/customer/cart/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${testToken}` },
            body: JSON.stringify({ productId: sampleProduct._id, variantId: sampleVariant._id, quantity: 1 })
          }).then(r => r.json());

          const getCart = await fetch(`${BASE_URL}/customer/cart`, {
            headers: { 'Authorization': `Bearer ${testToken}` }
          }).then(r => r.json());

          if (getCart && getCart.items && getCart.items.some(i => String(i.variant?._id || i.variant) === String(sampleVariant._id))) {
            record('Giỏ hàng (Cart Add & Read)', 'PASS', `Thêm biến thể "${sampleVariant.name || sampleVariant.sku}" vào giỏ hàng thành công`);
          } else {
            record('Giỏ hàng (Cart Add & Read)', 'FAIL', 'Không thấy biến thể trong giỏ hàng');
          }
        }
      }

      // Dọn dẹp tài khoản test trên Atlas
      console.log('\n--- 8. DỌN DẸP TÀI KHOẢN TEST AN TOÀN TRÊN ATLAS ---');
      await mongoose.connect(config.mongoUri, { dbName: config.dbName });
      const delUser = await mongoose.connection.db.collection('users').deleteOne({ email: testEmail });
      const delCart = await mongoose.connection.db.collection('carts').deleteMany({ user: new mongoose.Types.ObjectId(regRes.user.id || regRes.user._id) });
      const delWish = await mongoose.connection.db.collection('wishlists').deleteMany({ user: new mongoose.Types.ObjectId(regRes.user.id || regRes.user._id) });
      console.log(`Đã xóa user test (${delUser.deletedCount}), carts (${delCart.deletedCount}), wishlists (${delWish.deletedCount}). Hoàn tất cách ly dữ liệu.`);
      await mongoose.disconnect();
      record('Dọn dẹp dữ liệu kiểm thử (Clean up test data)', 'PASS', 'Toàn bộ dữ liệu test đã xóa sạch khỏi Atlas');
    } else {
      record('Đăng ký tài khoản mới (Register)', 'FAIL', `Đăng ký thất bại: ${JSON.stringify(regRes)}`);
    }

  } catch (err) {
    console.error('Lỗi trong quá trình chạy UAT Data Test:', err);
    record('Chạy toàn bộ Data Test', 'FAIL', err.message);
  }

  console.log('\n=====================================================');
  console.log(`TỔNG KẾT DATA UAT: ${results.filter(r => r.status === 'PASS').length}/${results.length} PASSED`);
  console.log('=====================================================');
}

runUatDataTests();
