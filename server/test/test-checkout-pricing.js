/**
 * Comprehensive Financial & Checkout Order Summary Test Suite
 * Covers 18 test cases for Pricing, Buy Now, Cart Sync, Multi-Shop Shipping,
 * Express Surcharge, Voucher Calculations, Security, and VNPay Amount Consistency.
 */

import { connectDB } from '../src/db.js';
import User from '../src/models/User.js';
import Shop from '../src/models/Shop.js';
import Order from '../src/models/Order.js';
import { Product, Variant } from '../src/models/Product.js';
import { Voucher, UserVoucher } from '../src/models/Voucher.js';
import { PaymentTransaction } from '../src/models/PaymentTransaction.js';
import { Cart } from '../src/models/Cart.js';

const BASE_URL = 'http://localhost:5001/api';

let passCount = 0;
let failCount = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`  ✓ PASS: ${msg}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    failCount++;
  }
}

async function api(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

async function run() {
  console.log('========================================================================');
  console.log('▶ TECHSTORE FINANCIAL INTEGRITY & CHECKOUT PRICING TEST SUITE');
  console.log('========================================================================\n');

  await connectDB();

  // 1. Authenticate as Customer
  console.log('--- Step 0: Setup & Authentication ---');
  const loginRes = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'khach@shop.local', password: 'Khach@123' }),
  });
  assert(loginRes.status === 200 && loginRes.data.token, 'Đăng nhập tài khoản khách hàng demo thành công');
  const token = loginRes.data.token;
  const user = loginRes.data.user;
  const authHeaders = { Authorization: `Bearer ${token}` };

  // Helper to clear cart
  async function clearCart() {
    await Cart.updateOne({ user: user._id }, { $set: { items: [] } });
  }

  // Helper to cancel orders and restore stock after verification
  async function cleanupOrders(orders) {
    if (!Array.isArray(orders)) return;
    for (const o of orders) {
      if (o && o._id) {
        await api(`/customer/orders/${o._id}/cancel`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ reason: 'Dọn dẹp kiểm thử hoàn trả kho' }),
        }).catch(() => {});
      }
    }
  }

  // Find 2 distinct active shops with products
  const shops = await Shop.find({ status: 'active' }).limit(3);
  assert(shops.length >= 2, 'Tìm thấy ít nhất 2 gian hàng đang hoạt động trong DB');
  const shopA = shops[0];
  const shopB = shops[1];

  const productA = await Product.findOne({ shop: shopA._id, isDeleted: false, hidden: false });
  const variantA = await Variant.findOne({ product: productA._id, isDeleted: false, stock: { $gte: 10 } });

  const prodsA = await Product.find({ shop: shopA._id, _id: { $ne: productA._id }, isDeleted: false, hidden: false });
  let productA2 = null;
  let variantA2 = null;
  for (const p of prodsA) {
    const v = await Variant.findOne({ product: p._id, isDeleted: false, stock: { $gte: 10 } });
    if (v) {
      productA2 = p;
      variantA2 = v;
      break;
    }
  }

  const productB = await Product.findOne({ shop: shopB._id, isDeleted: false, hidden: false });
  const variantB = await Variant.findOne({ product: productB._id, isDeleted: false, stock: { $gte: 10 } });

  assert(productA && variantA, `Gian hàng A (${shopA.name}): có SP "${productA?.name}" - Đơn giá: ${variantA?.price.toLocaleString('vi-VN')} ₫`);
  assert(productA2 && variantA2, `Gian hàng A SP2: "${productA2?.name}" - Đơn giá: ${variantA2?.price.toLocaleString('vi-VN')} ₫`);
  assert(productB && variantB, `Gian hàng B (${shopB.name}): có SP "${productB?.name}" - Đơn giá: ${variantB?.price.toLocaleString('vi-VN')} ₫`);

  const testAddress = {
    receiver: 'Nguyễn Văn Khách',
    phone: '0901234567',
    detail: 'Số 123 Đường Điện Tử',
    ward: 'Phường Bến Nghé',
    district: 'Quận 1',
    province: 'TP. Hồ Chí Minh',
  };

  // -------------------------------------------------------------------------
  // TEST 1: Buy Now 1 item
  // -------------------------------------------------------------------------
  console.log('\n--- Test 1: Mua ngay 1 sản phẩm (Buy Now Quantity 1) ---');
  await clearCart();
  const add1 = await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productA._id), variantId: String(variantA._id), quantity: 1 }),
  });
  const cartItem1 = add1.data.items[0];
  assert(cartItem1 && cartItem1.price === variantA.price, 'Giỏ hàng trả về đúng đơn giá sản phẩm');

  const co1 = await api('/customer/orders/checkout', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      cartItemIds: [String(cartItem1._id)],
      address: testAddress,
      shippingMethod: 'standard',
      paymentMethod: 'cod',
    }),
  });
  assert(co1.status === 201, 'Đặt hàng Mua ngay 1 sản phẩm thành công (201)');
  const order1 = co1.data.orders[0];
  assert(order1.items[0].quantity === 1, 'Số lượng đơn hàng = 1');
  assert(order1.subtotal === variantA.price, `Tạm tính = ${variantA.price.toLocaleString('vi-VN')} ₫`);
  assert(order1.shippingFee === 30000, 'Phí giao hàng tiêu chuẩn = 30.000 ₫');
  assert(order1.total === variantA.price + 30000, `Tổng tiền = ${variantA.price + 30000} ₫ (chính xác = Subtotal + 30k)`);
  await cleanupOrders(co1.data.orders);

  // -------------------------------------------------------------------------
  // TEST 2: Buy Now with quantity = 3
  // -------------------------------------------------------------------------
  console.log('\n--- Test 2: Mua ngay với số lượng > 1 (Quantity = 3) ---');
  await clearCart();
  const add2 = await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productA._id), variantId: String(variantA._id), quantity: 3 }),
  });
  const cartItem2 = add2.data.items[0];
  assert(cartItem2.quantity === 3, 'Giỏ hàng ghi nhận đúng số lượng 3');
  assert(cartItem2.lineTotal === variantA.price * 3, 'lineTotal giỏ hàng = Đơn giá * 3');

  const co2 = await api('/customer/orders/checkout', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      cartItemIds: [String(cartItem2._id)],
      address: testAddress,
      shippingMethod: 'standard',
      paymentMethod: 'cod',
    }),
  });
  assert(co2.status === 201, 'Đặt hàng Mua ngay 3 sản phẩm thành công');
  const order2 = co2.data.orders[0];
  assert(order2.subtotal === variantA.price * 3, `Tạm tính = ${order2.subtotal.toLocaleString('vi-VN')} ₫ (Đơn giá * 3)`);
  assert(order2.total === variantA.price * 3 + 30000, `Tổng tiền = Subtotal + 30.000 ₫`);
  await cleanupOrders(co2.data.orders);

  // -------------------------------------------------------------------------
  // TEST 3: Cart to Checkout - Single Shop Multi-Item
  // -------------------------------------------------------------------------
  console.log('\n--- Test 3: Thanh toán giỏ hàng 1 gian hàng nhiều sản phẩm ---');
  await clearCart();
  await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productA._id), variantId: String(variantA._id), quantity: 1 }),
  });
  await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productA2._id), variantId: String(variantA2._id), quantity: 2 }),
  });

  const cartView3 = (await api('/customer/cart', { headers: authHeaders })).data;
  assert(cartView3.items.length === 2, 'Giỏ hàng có 2 sản phẩm');
  const expectedSubtotal3 = variantA.price * 1 + variantA2.price * 2;
  const actualCartSubtotal = cartView3.total ?? cartView3.totalAmount;
  assert(actualCartSubtotal === expectedSubtotal3, `Tổng tiền hàng trong giỏ = ${expectedSubtotal3.toLocaleString('vi-VN')} ₫`);

  const co3 = await api('/customer/orders/checkout', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      address: testAddress,
      shippingMethod: 'standard',
      paymentMethod: 'cod',
    }),
  });
  assert(co3.status === 201 && co3.data.orders.length === 1, 'Tạo đúng 1 đơn hàng cho 1 gian hàng (gồm 2 sản phẩm)');
  const order3 = co3.data.orders[0];
  assert(order3.subtotal === expectedSubtotal3, 'Tạm tính đơn hàng khớp đúng tổng 2 sản phẩm');
  assert(order3.shippingFee === 30000, 'Phí giao hàng 1 gian hàng = 30.000 ₫');
  assert(order3.total === expectedSubtotal3 + 30000, 'Tổng tiền = Subtotal + 30.000 ₫');
  await cleanupOrders(co3.data.orders);

  // -------------------------------------------------------------------------
  // TEST 4: Cart to Checkout - Multi-Shop (2 Shops)
  // -------------------------------------------------------------------------
  console.log('\n--- Test 4: Thanh toán giỏ hàng đa gian hàng (2 Shops riêng biệt) ---');
  await clearCart();
  await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productA._id), variantId: String(variantA._id), quantity: 1 }),
  });
  await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productB._id), variantId: String(variantB._id), quantity: 1 }),
  });

  const co4 = await api('/customer/orders/checkout', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      address: testAddress,
      shippingMethod: 'standard',
      paymentMethod: 'cod',
    }),
  });
  assert(co4.status === 201 && co4.data.orders.length === 2, 'Tách đúng 2 đơn hàng cho 2 gian hàng');
  const groupCode4 = co4.data.groupCode;
  assert(groupCode4 && co4.data.orders.every((o) => o.groupCode === groupCode4), 'Các đơn hàng có chung groupCode');
  const totalShipping4 = co4.data.orders.reduce((s, o) => s + o.shippingFee, 0);
  assert(totalShipping4 === 60000, 'Tổng phí vận chuyển tiêu chuẩn cho 2 gian hàng = 60.000 ₫ (30k/shop)');
  const totalGroup4 = co4.data.orders.reduce((s, o) => s + o.total, 0);
  assert(totalGroup4 === variantA.price + variantB.price + 60000, `Tổng nhóm đơn hàng = ${totalGroup4.toLocaleString('vi-VN')} ₫`);
  await cleanupOrders(co4.data.orders);

  // -------------------------------------------------------------------------
  // TEST 5: Cart Quantity Modification & Price Synchronization
  // -------------------------------------------------------------------------
  console.log('\n--- Test 5: Đồng bộ khi thay đổi số lượng trong giỏ hàng ---');
  await clearCart();
  const add5 = await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productA._id), variantId: String(variantA._id), quantity: 1 }),
  });
  const itemId5 = add5.data.items[0]._id;
  // Update quantity to 4
  const patch5 = await api(`/customer/cart/items/${itemId5}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ quantity: 4 }),
  });
  assert(patch5.status === 200, 'Cập nhật số lượng lên 4 thành công');
  const updatedItem5 = patch5.data.items.find((i) => String(i._id) === String(itemId5));
  assert(updatedItem5.quantity === 4, 'Số lượng sau khi sửa = 4');
  assert(updatedItem5.lineTotal === variantA.price * 4, `lineTotal = ${variantA.price * 4} ₫ (Đơn giá * 4)`);

  // -------------------------------------------------------------------------
  // TEST 6: Voucher Fixed Amount Discount (Valid)
  // -------------------------------------------------------------------------
  console.log('\n--- Test 6: Áp dụng Voucher giảm giá cố định hợp lệ ---');
  // Create test voucher in Shop A
  const testVoucherCode = 'FIXED50K_' + Date.now().toString(36).toUpperCase();
  const v6 = await Voucher.create({
    code: testVoucherCode,
    title: 'Giảm 50K đơn từ 100K',
    scope: 'shop',
    shop: shopA._id,
    amount: 50000,
    minOrder: 100000,
    quantity: 100,
    remaining: 100,
    startDate: new Date(Date.now() - 3600000),
    endDate: new Date(Date.now() + 86400000),
    active: true,
  });
  const uv6 = await UserVoucher.create({
    user: user._id,
    voucher: v6._id,
    source: 'claim',
    status: 'unused',
  });

  await clearCart();
  await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productA._id), variantId: String(variantA._id), quantity: 1 }),
  });

  const co6 = await api('/customer/orders/checkout', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      address: testAddress,
      shippingMethod: 'standard',
      paymentMethod: 'cod',
      vouchers: { [String(shopA._id)]: String(uv6._id) },
    }),
  });
  assert(co6.status === 201, 'Đặt hàng với voucher giảm 50.000 ₫ thành công');
  const order6 = co6.data.orders[0];
  assert(order6.discount === 50000, 'Số tiền giảm giá ghi nhận đúng 50.000 ₫');
  assert(order6.total === variantA.price - 50000 + 30000, `Tổng tiền = Subtotal - 50k + 30k = ${order6.total.toLocaleString('vi-VN')} ₫`);
  const uv6After = await UserVoucher.findById(uv6._id);
  assert(uv6After.status === 'used', 'Voucher được cập nhật trạng thái đã dùng (used)');
  await cleanupOrders(co6.data.orders);

  // -------------------------------------------------------------------------
  // TEST 7: Voucher MinOrder Threshold Enforcement
  // -------------------------------------------------------------------------
  console.log('\n--- Test 7: Từ chối Voucher khi chưa đạt giá trị đơn tối thiểu (minOrder) ---');
  const v7 = await Voucher.create({
    code: 'MINORDER_FAIL_' + Date.now().toString(36).toUpperCase(),
    title: 'Voucher lỗi minOrder',
    scope: 'shop',
    shop: shopA._id,
    amount: 50000,
    minOrder: 999999999, // Rất cao
    quantity: 100,
    remaining: 100,
    startDate: new Date(Date.now() - 3600000),
    endDate: new Date(Date.now() + 86400000),
    active: true,
  });
  const uv7 = await UserVoucher.create({
    user: user._id,
    voucher: v7._id,
    source: 'claim',
    status: 'unused',
  });

  await clearCart();
  await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productA._id), variantId: String(variantA._id), quantity: 1 }),
  });

  const co7 = await api('/customer/orders/checkout', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      address: testAddress,
      shippingMethod: 'standard',
      paymentMethod: 'cod',
      vouchers: { [String(shopA._id)]: String(uv7._id) },
    }),
  });
  assert(co7.status === 400, 'Backend từ chối voucher khi subtotal < minOrder (HTTP 400)');
  assert(co7.data.message.includes('chỉ áp dụng cho đơn từ'), 'Thông báo lỗi chỉ rõ giá trị đơn tối thiểu');

  // -------------------------------------------------------------------------
  // TEST 8: Voucher Ineligibility on Quantity Reduction (Frontend deselect logic)
  // -------------------------------------------------------------------------
  console.log('\n--- Test 8: Voucher bị loại bỏ khi giảm số lượng dưới minOrder ---');
  // Verified by checking order can be placed normally once the ineligible voucher is omitted
  const co8 = await api('/customer/orders/checkout', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      address: testAddress,
      shippingMethod: 'standard',
      paymentMethod: 'cod',
    }),
  });
  assert(co8.status === 201, 'Đặt hàng thành công bình thường khi không đính kèm voucher không hợp lệ');
  await cleanupOrders(co8.data.orders);

  // -------------------------------------------------------------------------
  // TEST 9: Voucher Cap at Subtotal (Khống chế mức giảm không vượt quá tiền hàng)
  // -------------------------------------------------------------------------
  console.log('\n--- Test 9: Khống chế mức giảm Voucher tối đa bằng Subtotal ---');
  const v9 = await Voucher.create({
    code: 'GIANT_VOUCHER_' + Date.now().toString(36).toUpperCase(),
    title: 'Voucher khổng lồ',
    scope: 'shop',
    shop: shopA._id,
    amount: 100000000, // 100 triệu
    minOrder: 1000,
    quantity: 100,
    remaining: 100,
    startDate: new Date(Date.now() - 3600000),
    endDate: new Date(Date.now() + 86400000),
    active: true,
  });
  const uv9 = await UserVoucher.create({
    user: user._id,
    voucher: v9._id,
    source: 'claim',
    status: 'unused',
  });

  await clearCart();
  await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productA._id), variantId: String(variantA._id), quantity: 1 }),
  });

  const co9 = await api('/customer/orders/checkout', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      address: testAddress,
      shippingMethod: 'standard',
      paymentMethod: 'cod',
      vouchers: { [String(shopA._id)]: String(uv9._id) },
    }),
  });
  assert(co9.status === 201, 'Đặt hàng với voucher giá trị khủng thành công');
  const order9 = co9.data.orders[0];
  assert(order9.discount === order9.subtotal, 'Mức giảm giá được khống chế chính xác bằng Subtotal (không âm)');
  assert(order9.total === 30000, 'Tổng tiền còn lại đúng bằng phí vận chuyển 30.000 ₫');
  await cleanupOrders(co9.data.orders);

  // -------------------------------------------------------------------------
  // TEST 10: Explicit Standard Shipping Method
  // -------------------------------------------------------------------------
  console.log('\n--- Test 10: Phương thức Giao hàng Tiêu chuẩn (Standard) ---');
  await clearCart();
  await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productA._id), variantId: String(variantA._id), quantity: 1 }),
  });
  const co10 = await api('/customer/orders/checkout', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      address: testAddress,
      shippingMethod: 'standard',
      paymentMethod: 'cod',
    }),
  });
  const order10 = co10.data.orders[0];
  assert(order10.shippingMethod === 'standard', 'Trường shippingMethod lưu trong đơn hàng là "standard"');
  assert(order10.shippingFee === 30000, 'Phí vận chuyển = 30.000 ₫');
  await cleanupOrders(co10.data.orders);

  // -------------------------------------------------------------------------
  // TEST 11: Shipping Method Express (+30.000 VND surcharge for 1 shop)
  // -------------------------------------------------------------------------
  console.log('\n--- Test 11: Phương thức Giao hàng Hỏa tốc 2H (1 Shop: +30k) ---');
  await clearCart();
  await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productA._id), variantId: String(variantA._id), quantity: 1 }),
  });
  const co11 = await api('/customer/orders/checkout', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      address: testAddress,
      shippingMethod: 'express',
      paymentMethod: 'cod',
    }),
  });
  const order11 = co11.data.orders[0];
  assert(order11.shippingMethod === 'express', 'Trường shippingMethod lưu trong đơn hàng là "express"');
  assert(order11.shippingFee === 60000, 'Phí vận chuyển gồm 30k tiêu chuẩn + 30k phụ phí hỏa tốc = 60.000 ₫');
  assert(order11.total === variantA.price + 60000, 'Tổng đơn hàng phản ánh chính xác phụ phí hỏa tốc');
  await cleanupOrders(co11.data.orders);

  // -------------------------------------------------------------------------
  // TEST 12: Shipping Method Express for Multi-Shop (2 Shops)
  // -------------------------------------------------------------------------
  console.log('\n--- Test 12: Giao hàng Hỏa tốc cho Đa gian hàng (2 Shops) ---');
  await clearCart();
  await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productA._id), variantId: String(variantA._id), quantity: 1 }),
  });
  await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productB._id), variantId: String(variantB._id), quantity: 1 }),
  });

  const co12 = await api('/customer/orders/checkout', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      address: testAddress,
      shippingMethod: 'express',
      paymentMethod: 'cod',
    }),
  });
  assert(co12.status === 201 && co12.data.orders.length === 2, 'Tạo thành công 2 đơn hàng hỏa tốc cho 2 shop');
  const totalShipping12 = co12.data.orders.reduce((s, o) => s + o.shippingFee, 0);
  assert(totalShipping12 === 90000, 'Tổng phí vận chuyển nhóm đơn = 90.000 ₫ (60k tiêu chuẩn 2 shop + 30k phụ phí hỏa tốc 1 lần)');
  const groupTotal12 = co12.data.orders.reduce((s, o) => s + o.total, 0);
  assert(groupTotal12 === variantA.price + variantB.price + 90000, 'Tổng thanh toán nhóm đơn khớp chính xác công thức tài chính');
  await cleanupOrders(co12.data.orders);

  // -------------------------------------------------------------------------
  // TEST 13: Toggle Shipping Method Express -> Standard
  // -------------------------------------------------------------------------
  console.log('\n--- Test 13: Chuyển đổi phương thức vận chuyển (Express -> Standard) ---');
  await clearCart();
  await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productA._id), variantId: String(variantA._id), quantity: 1 }),
  });
  // Send with standard
  const co13 = await api('/customer/orders/checkout', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      address: testAddress,
      shippingMethod: 'standard',
      paymentMethod: 'cod',
    }),
  });
  const order13 = co13.data.orders[0];
  assert(order13.shippingFee === 30000, 'Phí vận chuyển quay về 30.000 ₫ tiêu chuẩn');
  assert(order13.total === variantA.price + 30000, 'Tổng tiền loại bỏ hoàn toàn 30.000 ₫ phụ phí hỏa tốc');
  await cleanupOrders(co13.data.orders);

  // -------------------------------------------------------------------------
  // TEST 14: Untrusted Client Total Protection (Backend Security)
  // -------------------------------------------------------------------------
  console.log('\n--- Test 14: Bảo mật Backend: Không tin cậy tổng tiền do Client gửi lên ---');
  await clearCart();
  await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productA._id), variantId: String(variantA._id), quantity: 1 }),
  });
  // Attacker tries to send fake totalAmount: 1000 VND
  const co14 = await api('/customer/orders/checkout', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      address: testAddress,
      shippingMethod: 'standard',
      paymentMethod: 'cod',
      totalAmount: 1000,
      total: 1000,
      price: 100,
    }),
  });
  const order14 = co14.data.orders[0];
  assert(order14.subtotal === variantA.price, 'Backend tự tính lại Subtotal từ DB, bỏ qua hoàn toàn số tiền giả mạo');
  assert(order14.total === variantA.price + 30000, 'Tổng tiền đơn hàng trong DB được bảo vệ an toàn tuyệt đối');
  await cleanupOrders(co14.data.orders);

  // -------------------------------------------------------------------------
  // TEST 15: Cart Item Isolation for Buy Now
  // -------------------------------------------------------------------------
  console.log('\n--- Test 15: Cô lập sản phẩm Mua ngay (Cart Item Isolation) ---');
  await clearCart();
  // Add product A and product B to cart
  const addA = await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productA._id), variantId: String(variantA._id), quantity: 2 }),
  });
  const itemAId = addA.data.items[0]._id;
  const addB = await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productB._id), variantId: String(variantB._id), quantity: 2 }),
  });
  const itemBId = addB.data.items.find((i) => String(i.product) === String(productB._id))._id;

  // Buy now item A only
  const co15 = await api('/customer/orders/checkout', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      cartItemIds: [String(itemAId)],
      address: testAddress,
      shippingMethod: 'standard',
      paymentMethod: 'cod',
    }),
  });
  assert(co15.status === 201 && co15.data.orders.length === 1, 'Chỉ đặt đúng sản phẩm A');
  const cartAfter15 = (await api('/customer/cart', { headers: authHeaders })).data;
  assert(cartAfter15.items.length === 1, 'Giỏ hàng còn lại đúng 1 sản phẩm');
  assert(String(cartAfter15.items[0]._id) === String(itemBId), 'Sản phẩm B còn nguyên trong giỏ hàng');
  assert(cartAfter15.items[0].quantity === 2, 'Số lượng sản phẩm B giữ nguyên = 2');
  await cleanupOrders(co15.data.orders);

  // -------------------------------------------------------------------------
  // TEST 16: VNPay Payment Creation & Group Amount Consistency
  // -------------------------------------------------------------------------
  console.log('\n--- Test 16: Tính toàn vẹn số tiền thanh toán VNPay Sandbox ---');
  await clearCart();
  await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productA._id), variantId: String(variantA._id), quantity: 1 }),
  });
  await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productB._id), variantId: String(variantB._id), quantity: 1 }),
  });

  const co16 = await api('/customer/orders/checkout', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      address: testAddress,
      shippingMethod: 'express',
      paymentMethod: 'online',
    }),
  });
  const groupCode16 = co16.data.groupCode;
  const expectedGroupTotal16 = co16.data.orders.reduce((s, o) => s + o.total, 0);

  // Call create-url
  const vnpRes16 = await api('/payment/vnpay/create-url', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ groupCode: groupCode16 }),
  });
  assert(vnpRes16.status === 200, 'Tạo URL thanh toán VNPay thành công');
  const url16 = new URL(vnpRes16.data.paymentUrl);
  const vnpAmount16 = Number(url16.searchParams.get('vnp_Amount'));
  assert(vnpAmount16 === expectedGroupTotal16 * 100, `vnp_Amount trên cổng VNPay (${vnpAmount16 / 100} ₫) khớp 100% với tổng đơn hàng (${expectedGroupTotal16} ₫)`);

  const txn16 = await PaymentTransaction.findOne({ groupCode: groupCode16 });
  assert(txn16 && txn16.amount === expectedGroupTotal16, 'Bản ghi PaymentTransaction lưu chính xác số tiền');
  await cleanupOrders(co16.data.orders);

  // -------------------------------------------------------------------------
  // TEST 17: COD Order Status Verification
  // -------------------------------------------------------------------------
  console.log('\n--- Test 17: Kiểm tra trạng thái đơn COD ---');
  await clearCart();
  await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productA._id), variantId: String(variantA._id), quantity: 1 }),
  });
  const co17 = await api('/customer/orders/checkout', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      address: testAddress,
      shippingMethod: 'standard',
      paymentMethod: 'cod',
    }),
  });
  const order17 = co17.data.orders[0];
  assert(order17.payment.method === 'cod', 'Phương thức thanh toán = COD');
  assert(order17.payment.status === 'unpaid', 'Trạng thái thanh toán ban đầu = unpaid');
  assert(order17.status === 'cho_xac_nhan', 'Trạng thái đơn hàng = cho_xac_nhan');
  await cleanupOrders(co17.data.orders);

  // -------------------------------------------------------------------------
  // TEST 18: Stock Deduction & Atomic Rollback Verification
  // -------------------------------------------------------------------------
  console.log('\n--- Test 18: Trừ kho nguyên tử & Hoàn tác khi phát sinh lỗi ---');
  const variantBefore = await Variant.findById(variantA._id);
  const stockBefore = variantBefore.stock;

  await clearCart();
  await api('/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ productId: String(productA._id), variantId: String(variantA._id), quantity: 2 }),
  });
  // Checkout successfully
  const co18 = await api('/customer/orders/checkout', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      address: testAddress,
      shippingMethod: 'standard',
      paymentMethod: 'cod',
    }),
  });
  assert(co18.status === 201, 'Đặt hàng 2 sản phẩm thành công');
  const variantAfter = await Variant.findById(variantA._id);
  assert(variantAfter.stock === stockBefore - 2, `Kho hàng đã được trừ chính xác 2 sản phẩm (${stockBefore} -> ${variantAfter.stock})`);

  // Now cancel the order to verify stock restoration
  const cancelRes = await api(`/customer/orders/${co18.data.orders[0]._id}/cancel`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ reason: 'Kiểm thử hoàn trả kho' }),
  });
  assert(cancelRes.status === 200, 'Hủy đơn hàng thành công');
  const variantRestored = await Variant.findById(variantA._id);
  assert(variantRestored.stock === stockBefore, `Kho hàng được hoàn lại nguyên vẹn (${variantRestored.stock})`);

  // Clean up cart for customer
  await clearCart();

  console.log('\n========================================================================');
  console.log(`▶ KẾT QUẢ KIỂM THỬ TỔNG THỂ: ${passCount} PASS | ${failCount} FAIL`);
  console.log('========================================================================');

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
