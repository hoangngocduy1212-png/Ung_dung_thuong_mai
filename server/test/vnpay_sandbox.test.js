import crypto from 'node:crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import { connectDB } from '../src/db.js';
import config from '../src/config.js';
import User from '../src/models/User.js';
import Shop from '../src/models/Shop.js';
import Order from '../src/models/Order.js';
import { Product, Variant } from '../src/models/Product.js';
import { Category } from '../src/models/Catalog.js';
import { Voucher, UserVoucher } from '../src/models/Voucher.js';
import { PaymentTransaction } from '../src/models/PaymentTransaction.js';
import * as vnpayService from '../src/services/vnpayService.js';
import { genCode } from '../src/utils/helpers.js';

let server;
let url;
let pass = 0;
const fails = [];

const ok = (cond, msg) => {
  if (cond) {
    pass++;
    console.log(`  ✓ PASS: ${msg}`);
  } else {
    fails.push(msg);
    console.log(`  ✗ FAIL: ${msg}`);
  }
};

const section = (t) => console.log(`\n========================================\n▶ ${t}\n========================================`);

async function call(method, path, body, token) {
  const res = await fetch(url + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  return { s: res.status, d: data };
}

function buildSignedVnpParams(params, secret = config.vnpay.hashSecret) {
  const sorted = vnpayService.sortObject(params);
  const signData = vnpayService.buildSignData(sorted);
  const hash = vnpayService.hmacSha512(signData, secret);
  return { ...sorted, vnp_SecureHash: hash };
}

function toQueryString(params) {
  return Object.keys(params)
    .map((k) => `${k}=${params[k]}`)
    .join('&');
}

export async function runVnpayTestSuite() {
  console.log('\n======================================================');
  console.log('   TECHSTORE VNPAY SANDBOX COMPREHENSIVE TEST SUITE   ');
  console.log('======================================================\n');

  await connectDB();
  server = app.listen(0);
  url = `http://127.0.0.1:${server.address().port}/api`;

  try {
    // ----------------- SETUP TEST DATA -----------------
    const passwordHash = await bcrypt.hash('Test@123', 8);

    const customer1 = await User.create({
      fullName: 'Khách Hàng Một',
      email: 'c1_vnpay@test.local',
      phone: '0901111111',
      role: 'customer',
      passwordHash,
    });

    const customer2 = await User.create({
      fullName: 'Khách Hàng Hai',
      email: 'c2_vnpay@test.local',
      phone: '0902222222',
      role: 'customer',
      passwordHash,
    });

    const sellerUser1 = await User.create({
      fullName: 'Chủ Shop Một',
      email: 'seller1_vnpay@test.local',
      phone: '0903333333',
      role: 'seller',
      passwordHash,
    });

    const sellerUser2 = await User.create({
      fullName: 'Chủ Shop Hai',
      email: 'seller2_vnpay@test.local',
      phone: '0903333334',
      role: 'seller',
      passwordHash,
    });

    const category = await Category.create({
      name: 'Thiết bị công nghệ',
      isDeleted: false,
    });

    const shop1 = await Shop.create({
      name: 'Shop Tech One',
      nameKey: 'shop-tech-one',
      owner: sellerUser1._id,
      status: 'active',
      phone: '0903333333',
    });

    const shop2 = await Shop.create({
      name: 'Shop Tech Two',
      nameKey: 'shop-tech-two',
      owner: sellerUser2._id,
      status: 'active',
      phone: '0903333334',
    });

    const product1 = await Product.create({
      name: 'Tai nghe Bluetooth Pro',
      shop: shop1._id,
      category: category._id,
      minPrice: 500000,
      isDeleted: false,
      hidden: false,
    });

    const variant1 = await Variant.create({
      product: product1._id,
      name: 'Đen',
      price: 500000,
      stock: 50,
      isDeleted: false,
    });

    const product2 = await Product.create({
      name: 'Bàn phím cơ Mini',
      shop: shop2._id,
      category: category._id,
      minPrice: 800000,
      isDeleted: false,
      hidden: false,
    });

    const variant2 = await Variant.create({
      product: product2._id,
      name: 'Trắng Blue Switch',
      price: 800000,
      stock: 30,
      isDeleted: false,
    });

    // Login tokens
    const loginC1 = (await call('POST', '/auth/login', { email: 'c1_vnpay@test.local', password: 'Test@123' })).d.token;
    const loginC2 = (await call('POST', '/auth/login', { email: 'c2_vnpay@test.local', password: 'Test@123' })).d.token;

    // Helper to create an order group for customer
    async function createOrderGroup(cust, shopList, opts = {}) {
      const groupCode = genCode('TT');
      const orders = [];
      for (const s of shopList) {
        const order = await Order.create({
          code: genCode('DH'),
          groupCode,
          customer: cust._id,
          shop: s.shop._id,
          items: [
            {
              product: s.product._id,
              variant: s.variant._id,
              productName: s.product.name,
              variantName: s.variant.name,
              price: s.variant.price,
              quantity: 1,
            },
          ],
          shippingAddress: {
            receiver: cust.fullName,
            phone: cust.phone,
            detail: '123 Test Street',
            ward: 'Phường 1',
            district: 'Quận 1',
            province: 'TP. HCM',
          },
          subtotal: s.variant.price,
          shippingFee: 30000,
          discount: 0,
          total: s.variant.price + 30000,
          sellerRevenue: s.variant.price,
          status: opts.status || 'cho_xac_nhan',
          payment: {
            method: 'online',
            status: opts.paymentStatus || 'unpaid',
            paidAt: opts.paidAt,
            txnId: opts.txnId,
          },
        });
        orders.push(order);
      }
      return { groupCode, orders };
    }

    // ==============================================================
    // 1. Tạo URL thanh toán hợp lệ
    // ==============================================================
    section('1. Tạo URL thanh toán hợp lệ (POST /api/payment/vnpay/create-url)');
    const test1 = await createOrderGroup(customer1, [{ shop: shop1, product: product1, variant: variant1 }]);
    const res1 = await call('POST', '/payment/vnpay/create-url', { groupCode: test1.groupCode }, loginC1);
    ok(res1.s === 200, 'HTTP Status 200 OK');
    ok(typeof res1.d.paymentUrl === 'string' && res1.d.paymentUrl.includes('vnp_SecureHash='), 'Trả về paymentUrl chứa chữ ký vnp_SecureHash');
    ok(res1.d.amount === 530000, 'Số tiền khóa chính xác từ backend (500k + 30k ship = 530k)');
    const txn1 = await PaymentTransaction.findOne({ txnRef: res1.d.txnRef });
    ok(txn1 && txn1.status === 'pending' && txn1.amount === 530000, 'PaymentTransaction đã lưu trong CSDL với status pending');

    // ==============================================================
    // 2. Không có quyền thanh toán Order của người khác
    // ==============================================================
    section('2. Không có quyền thanh toán Order của người khác (Customer 2 gọi đơn Customer 1)');
    const res2 = await call('POST', '/payment/vnpay/create-url', { groupCode: test1.groupCode }, loginC2);
    ok(res2.s === 403, 'Bị từ chối với HTTP 403 Forbidden');
    ok(res2.d.message && res2.d.message.includes('không có quyền'), 'Thông báo lỗi phân quyền rõ ràng');

    // ==============================================================
    // 3. Nhóm đơn không tồn tại
    // ==============================================================
    section('3. Nhóm đơn không tồn tại');
    const res3 = await call('POST', '/payment/vnpay/create-url', { groupCode: 'TT_NON_EXISTENT_999' }, loginC1);
    ok(res3.s === 404, 'Trả về HTTP 404 Not Found');

    // ==============================================================
    // 4. Nhóm đơn đã thanh toán trước đó
    // ==============================================================
    section('4. Nhóm đơn đã thanh toán trước đó');
    const test4 = await createOrderGroup(customer1, [{ shop: shop1, product: product1, variant: variant1 }], { paymentStatus: 'paid' });
    const res4 = await call('POST', '/payment/vnpay/create-url', { groupCode: test4.groupCode }, loginC1);
    ok(res4.s === 400, 'Bị từ chối với HTTP 400 Bad Request');
    ok(res4.d.message && res4.d.message.includes('đã được thanh toán'), 'Báo lỗi đơn đã thanh toán');

    // ==============================================================
    // 5. Nhóm đơn đã hủy
    // ==============================================================
    section('5. Nhóm đơn đã hủy');
    const test5 = await createOrderGroup(customer1, [{ shop: shop1, product: product1, variant: variant1 }], { status: 'da_huy' });
    const res5 = await call('POST', '/payment/vnpay/create-url', { groupCode: test5.groupCode }, loginC1);
    ok(res5.s === 400, 'Bị từ chối với HTTP 400 Bad Request');
    ok(res5.d.message && res5.d.message.includes('đã bị hủy'), 'Báo lỗi đơn đã bị hủy');

    // ==============================================================
    // 6. IPN: Chữ ký sai (Invalid Checksum)
    // ==============================================================
    section('6. IPN: Chữ ký sai (Invalid Checksum)');
    const badSignParams = {
      vnp_TmnCode: config.vnpay.tmnCode,
      vnp_Amount: '53000000',
      vnp_TxnRef: txn1.txnRef,
      vnp_ResponseCode: '00',
      vnp_TransactionStatus: '00',
      vnp_SecureHash: 'INVALID_CORRUPTED_HASH_HEX_123456',
    };
    const res6 = await call('GET', `/payment/vnpay/ipn?${toQueryString(badSignParams)}`);
    ok(res6.d.RspCode === '97', 'Trả về RspCode 97 - Invalid Checksum');

    // ==============================================================
    // 7. IPN: Sai TmnCode
    // ==============================================================
    section('7. IPN: Sai TmnCode');
    const wrongTmnParams = buildSignedVnpParams({
      vnp_TmnCode: 'WRONG_TMN_CODE',
      vnp_Amount: '53000000',
      vnp_TxnRef: txn1.txnRef,
      vnp_ResponseCode: '00',
      vnp_TransactionStatus: '00',
    });
    const res7 = await call('GET', `/payment/vnpay/ipn?${toQueryString(wrongTmnParams)}`);
    ok(res7.d.RspCode === '01', 'Trả về RspCode 01 - Order not found (Sai TmnCode)');

    // ==============================================================
    // 8. IPN: Sai số tiền (vnp_Amount mismatch)
    // ==============================================================
    section('8. IPN: Sai số tiền (vnp_Amount mismatch)');
    const wrongAmountParams = buildSignedVnpParams({
      vnp_TmnCode: config.vnpay.tmnCode,
      vnp_Amount: '99999900', // Khác 53000000
      vnp_TxnRef: txn1.txnRef,
      vnp_ResponseCode: '00',
      vnp_TransactionStatus: '00',
      vnp_CurrCode: 'VND',
    });
    const res8 = await call('GET', `/payment/vnpay/ipn?${toQueryString(wrongAmountParams)}`);
    ok(res8.d.RspCode === '04', 'Trả về RspCode 04 - Invalid Amount');

    // ==============================================================
    // 9. IPN: Sai đơn vị tiền tệ (Currency mismatch)
    // ==============================================================
    section('9. IPN: Sai đơn vị tiền tệ');
    const wrongCurrParams = buildSignedVnpParams({
      vnp_TmnCode: config.vnpay.tmnCode,
      vnp_Amount: '53000000',
      vnp_TxnRef: txn1.txnRef,
      vnp_ResponseCode: '00',
      vnp_TransactionStatus: '00',
      vnp_CurrCode: 'USD',
    });
    const res9 = await call('GET', `/payment/vnpay/ipn?${toQueryString(wrongCurrParams)}`);
    ok(res9.d.RspCode === '04', 'Trả về RspCode 04 - Invalid Currency');

    // ==============================================================
    // 10. IPN: Sai txnRef không tồn tại
    // ==============================================================
    section('10. IPN: Sai txnRef không tồn tại');
    const wrongTxnParams = buildSignedVnpParams({
      vnp_TmnCode: config.vnpay.tmnCode,
      vnp_Amount: '53000000',
      vnp_TxnRef: 'TXN_NON_EXISTENT_99999',
      vnp_ResponseCode: '00',
      vnp_TransactionStatus: '00',
    });
    const res10 = await call('GET', `/payment/vnpay/ipn?${toQueryString(wrongTxnParams)}`);
    ok(res10.d.RspCode === '01', 'Trả về RspCode 01 - Order not found');

    // ==============================================================
    // 11. IPN: ResponseCode thất bại (vnp_ResponseCode !== '00')
    // ==============================================================
    section('11. IPN: ResponseCode thất bại (Khách hàng hủy giao dịch: code 24)');
    const test11 = await createOrderGroup(customer1, [{ shop: shop1, product: product1, variant: variant1 }]);
    const url11 = (await call('POST', '/payment/vnpay/create-url', { groupCode: test11.groupCode }, loginC1)).d;
    const failRespParams = buildSignedVnpParams({
      vnp_TmnCode: config.vnpay.tmnCode,
      vnp_Amount: '53000000',
      vnp_TxnRef: url11.txnRef,
      vnp_ResponseCode: '24', // Hủy
      vnp_TransactionStatus: '02', // Thất bại
      vnp_TransactionNo: '14000111',
      vnp_CurrCode: 'VND',
    });
    const res11 = await call('GET', `/payment/vnpay/ipn?${toQueryString(failRespParams)}`);
    ok(res11.d.RspCode === '00', 'IPN tiếp nhận thành công (RspCode 00)');
    const txn11 = await PaymentTransaction.findOne({ txnRef: url11.txnRef });
    ok(txn11.status === 'failed', 'PaymentTransaction chuyển trạng thái failed');
    const order11 = await Order.findById(test11.orders[0]._id);
    ok(order11.payment.status === 'unpaid', 'Order VẪN LÀ unpaid (không đánh dấu nhầm là paid)');

    // ==============================================================
    // 12. IPN: TransactionStatus thất bại
    // ==============================================================
    section('12. IPN: TransactionStatus thất bại (vnp_ResponseCode 00 nhưng vnp_TransactionStatus 01)');
    const test12 = await createOrderGroup(customer1, [{ shop: shop1, product: product1, variant: variant1 }]);
    const url12 = (await call('POST', '/payment/vnpay/create-url', { groupCode: test12.groupCode }, loginC1)).d;
    const failTxnStatusParams = buildSignedVnpParams({
      vnp_TmnCode: config.vnpay.tmnCode,
      vnp_Amount: '53000000',
      vnp_TxnRef: url12.txnRef,
      vnp_ResponseCode: '00',
      vnp_TransactionStatus: '01', // Chưa hoàn tất
      vnp_TransactionNo: '14000112',
      vnp_CurrCode: 'VND',
    });
    const res12 = await call('GET', `/payment/vnpay/ipn?${toQueryString(failTxnStatusParams)}`);
    ok(res12.d.RspCode === '00', 'IPN tiếp nhận kết quả (RspCode 00)');
    const txn12 = await PaymentTransaction.findOne({ txnRef: url12.txnRef });
    ok(txn12.status === 'failed', 'PaymentTransaction chuyển status failed');
    const order12 = await Order.findById(test12.orders[0]._id);
    ok(order12.payment.status === 'unpaid', 'Order không bị cập nhật thành paid');

    // ==============================================================
    // 13. IPN: Thanh toán thành công thực sự
    // ==============================================================
    section('13. IPN: Thanh toán thành công thực sự (00 & 00)');
    const test13 = await createOrderGroup(customer1, [{ shop: shop1, product: product1, variant: variant1 }]);
    const url13 = (await call('POST', '/payment/vnpay/create-url', { groupCode: test13.groupCode }, loginC1)).d;
    const successParams = buildSignedVnpParams({
      vnp_TmnCode: config.vnpay.tmnCode,
      vnp_Amount: '53000000',
      vnp_TxnRef: url13.txnRef,
      vnp_ResponseCode: '00',
      vnp_TransactionStatus: '00',
      vnp_TransactionNo: '14999999',
      vnp_BankCode: 'NCB',
      vnp_BankTranNo: 'VNP14999999',
      vnp_CardType: 'ATM',
      vnp_PayDate: '20261118231500',
      vnp_CurrCode: 'VND',
    });
    const res13 = await call('GET', `/payment/vnpay/ipn?${toQueryString(successParams)}`);
    ok(res13.d.RspCode === '00', 'Trả về RspCode 00 - Confirm Success');
    const txn13 = await PaymentTransaction.findOne({ txnRef: url13.txnRef });
    ok(txn13.status === 'success', 'PaymentTransaction cập nhật status = success');
    ok(txn13.vnpTransactionNo === '14999999', 'Lưu đúng vnpTransactionNo');
    const order13 = await Order.findById(test13.orders[0]._id);
    ok(order13.payment.status === 'paid', 'Order.payment.status chuyển thành paid');
    ok(order13.payment.txnId === '14999999', 'Order.payment.txnId lưu đúng mã VNPay');

    // ==============================================================
    // 14. IPN: Lặp lại (Idempotency)
    // ==============================================================
    section('14. IPN: Lặp lại (Idempotency callback)');
    const res14 = await call('GET', `/payment/vnpay/ipn?${toQueryString(successParams)}`);
    ok(res14.d.RspCode === '02', 'Trả về RspCode 02 - Order already confirmed (không xử lý lần 2)');
    const ordersAfter14 = await Order.find({ groupCode: test13.groupCode });
    ok(ordersAfter14.length === 1 && ordersAfter14[0].payment.status === 'paid', 'Không sinh đơn trùng, không biến đổi dữ liệu');

    // ==============================================================
    // 15. IPN: Đồng thời (Concurrent IPN Calls)
    // ==============================================================
    section('15. IPN: Đồng thời (5 yêu cầu IPN đồng thời cùng một tham số)');
    const test15 = await createOrderGroup(customer1, [{ shop: shop1, product: product1, variant: variant1 }]);
    const url15 = (await call('POST', '/payment/vnpay/create-url', { groupCode: test15.groupCode }, loginC1)).d;
    const concurrentParams = buildSignedVnpParams({
      vnp_TmnCode: config.vnpay.tmnCode,
      vnp_Amount: '53000000',
      vnp_TxnRef: url15.txnRef,
      vnp_ResponseCode: '00',
      vnp_TransactionStatus: '00',
      vnp_TransactionNo: '14888888',
      vnp_CurrCode: 'VND',
    });
    const concurrentResponses = await Promise.all([
      call('GET', `/payment/vnpay/ipn?${toQueryString(concurrentParams)}`),
      call('GET', `/payment/vnpay/ipn?${toQueryString(concurrentParams)}`),
      call('GET', `/payment/vnpay/ipn?${toQueryString(concurrentParams)}`),
      call('GET', `/payment/vnpay/ipn?${toQueryString(concurrentParams)}`),
      call('GET', `/payment/vnpay/ipn?${toQueryString(concurrentParams)}`),
    ]);
    const rspCodes = concurrentResponses.map((r) => r.d.RspCode);
    const count00 = rspCodes.filter((c) => c === '00').length;
    const count02 = rspCodes.filter((c) => c === '02').length;
    ok(count00 === 1 && count02 === 4, `Chính xác 1 request ghi nhận 00 và 4 request trả về 02 (đã xác nhận)`);
    const order15 = await Order.findById(test15.orders[0]._id);
    ok(order15.payment.status === 'paid', 'Đơn hàng cuối cùng ở trạng thái paid an toàn');

    // ==============================================================
    // 16. Return URL bị giả mạo tham số
    // ==============================================================
    section('16. Return URL bị giả mạo tham số (Tampered amount)');
    const tamperedParams = { ...successParams, vnp_Amount: '100000' }; // Sửa số tiền nhưng không ký lại
    const res16 = await call('GET', `/payment/vnpay/verify-return?${toQueryString(tamperedParams)}`);
    ok(res16.d.isValid === false, 'Phát hiện chữ ký giả mạo (isValid = false)');
    ok(res16.d.message && res16.d.message.includes('không hợp lệ'), 'Thông báo chữ ký không hợp lệ');

    // ==============================================================
    // 17. Giao dịch hết hạn (Timeout cancellation & stock restore)
    // ==============================================================
    section('17. Giao dịch hết hạn (Timeout cancellation & stock restore)');
    const test17 = await createOrderGroup(customer1, [{ shop: shop1, product: product1, variant: variant1 }]);
    const url17 = (await call('POST', '/payment/vnpay/create-url', { groupCode: test17.groupCode }, loginC1)).d;
    // Làm giả thời gian hết hạn lùi về 1 giờ trước
    await PaymentTransaction.updateOne({ txnRef: url17.txnRef }, { expiresAt: new Date(Date.now() - 3600000) });
    const initialStock = (await Variant.findById(variant1._id)).stock;

    const expireCheckRes = await call('POST', '/payment/vnpay/check-expiry', { groupCode: test17.groupCode }, loginC1);
    ok(expireCheckRes.d.status === 'expired', 'Phát hiện giao dịch hết hạn (status = expired)');
    const order17 = await Order.findById(test17.orders[0]._id);
    ok(order17.status === 'da_huy', 'Order tự động chuyển sang da_huy');
    const finalStock = (await Variant.findById(variant1._id)).stock;
    ok(finalStock === initialStock + 1, 'Tồn kho được tự động hoàn trả đầy đủ');

    // ==============================================================
    // 18. Callback đến sau khi hết hạn
    // ==============================================================
    section('18. Callback đến sau khi đơn đã hết hạn và bị hủy');
    const lateParams = buildSignedVnpParams({
      vnp_TmnCode: config.vnpay.tmnCode,
      vnp_Amount: '53000000',
      vnp_TxnRef: url17.txnRef,
      vnp_ResponseCode: '00',
      vnp_TransactionStatus: '00',
      vnp_TransactionNo: '14777777',
      vnp_CurrCode: 'VND',
    });
    const res18 = await call('GET', `/payment/vnpay/ipn?${toQueryString(lateParams)}`);
    ok(res18.d.RspCode === '02', 'IPN muộn trả về RspCode 02 - Order closed/confirmed');
    const order18Check = await Order.findById(test17.orders[0]._id);
    ok(order18Check.status === 'da_huy', 'Order không bị hồi sinh hay biến đổi sang paid');

    // ==============================================================
    // 19. Retry hợp lệ (Khách hủy lần 1, thanh toán lại lần 2)
    // ==============================================================
    section('19. Retry hợp lệ (Thanh toán lại khi lần trước thất bại)');
    const test19 = await createOrderGroup(customer1, [{ shop: shop1, product: product1, variant: variant1 }]);
    // Lần 1: Tạo URL và thất bại
    const url19_1 = (await call('POST', '/payment/vnpay/create-url', { groupCode: test19.groupCode }, loginC1)).d;
    const failParams19 = buildSignedVnpParams({
      vnp_TmnCode: config.vnpay.tmnCode,
      vnp_Amount: '53000000',
      vnp_TxnRef: url19_1.txnRef,
      vnp_ResponseCode: '24',
      vnp_TransactionStatus: '02',
    });
    await call('GET', `/payment/vnpay/ipn?${toQueryString(failParams19)}`);

    // Lần 2: Thử lại thanh toán
    const url19_2 = (await call('POST', '/payment/vnpay/create-url', { groupCode: test19.groupCode }, loginC1)).d;
    ok(url19_2.txnRef !== url19_1.txnRef, 'Lần thử lại sinh txnRef mới độc lập');

    // Lần 2: Khách thanh toán thành công
    const successParams19 = buildSignedVnpParams({
      vnp_TmnCode: config.vnpay.tmnCode,
      vnp_Amount: '53000000',
      vnp_TxnRef: url19_2.txnRef,
      vnp_ResponseCode: '00',
      vnp_TransactionStatus: '00',
      vnp_TransactionNo: '14666666',
      vnp_CurrCode: 'VND',
    });
    const res19 = await call('GET', `/payment/vnpay/ipn?${toQueryString(successParams19)}`);
    ok(res19.d.RspCode === '00', 'Lần 2 thanh toán thành công (RspCode 00)');
    const order19 = await Order.findById(test19.orders[0]._id);
    ok(order19.payment.status === 'paid', 'Đơn hàng chuyển thành paid');

    // ==============================================================
    // 20. Không thể thanh toán lại Order đã paid
    // ==============================================================
    section('20. Không thể thanh toán lại Order đã paid');
    const res20 = await call('POST', '/payment/vnpay/create-url', { groupCode: test19.groupCode }, loginC1);
    ok(res20.s === 400, 'Bị chặn với HTTP 400 Bad Request');
    ok(res20.d.message && res20.d.message.includes('đã được thanh toán'), 'Thông báo đơn đã thanh toán');

    // ==============================================================
    // 21. Nhiều Order trong cùng một group được cập nhật nhất quán
    // ==============================================================
    section('21. Nhiều Order trong cùng một group (2 Shop: Shop 1 + Shop 2)');
    const test21 = await createOrderGroup(customer1, [
      { shop: shop1, product: product1, variant: variant1 }, // 500k + 30k = 530k
      { shop: shop2, product: product2, variant: variant2 }, // 800k + 30k = 830k
    ]);
    ok(test21.orders.length === 2, 'Tạo thành công 2 Order cho 2 Shop khác nhau');
    const expectedGroupTotal = 530000 + 830000; // 1.360.000đ

    const url21 = (await call('POST', '/payment/vnpay/create-url', { groupCode: test21.groupCode }, loginC1)).d;
    ok(url21.amount === expectedGroupTotal, `Tổng tiền thanh toán bằng tổng cả 2 Order (${expectedGroupTotal}đ)`);

    const multiShopSuccessParams = buildSignedVnpParams({
      vnp_TmnCode: config.vnpay.tmnCode,
      vnp_Amount: String(expectedGroupTotal * 100),
      vnp_TxnRef: url21.txnRef,
      vnp_ResponseCode: '00',
      vnp_TransactionStatus: '00',
      vnp_TransactionNo: '14555555',
      vnp_CurrCode: 'VND',
    });
    const res21 = await call('GET', `/payment/vnpay/ipn?${toQueryString(multiShopSuccessParams)}`);
    ok(res21.d.RspCode === '00', 'IPN đa shop thành công (RspCode 00)');

    const groupOrdersAfter = await Order.find({ groupCode: test21.groupCode });
    const allPaid = groupOrdersAfter.every((o) => o.payment.status === 'paid' && o.payment.txnId === '14555555');
    ok(allPaid, 'TẤT CẢ các Order thuộc các Shop khác nhau trong nhóm đều được cập nhật paid nhất quán');

    // ==============================================================
    // 22. Phát hiện và phục hồi khi cập nhật nhiều Order bị gián đoạn
    // ==============================================================
    section('22. Phát hiện và phục hồi cập nhật dở dang (Inconsistency Detection & Auto-healing)');
    const test22 = await createOrderGroup(customer1, [
      { shop: shop1, product: product1, variant: variant1 },
      { shop: shop2, product: product2, variant: variant2 },
    ]);
    const url22 = (await call('POST', '/payment/vnpay/create-url', { groupCode: test22.groupCode }, loginC1)).d;

    // Giả lập cập nhật dở dang: đơn 1 đã paid, đơn 2 chưa paid
    await Order.updateOne({ _id: test22.orders[0]._id }, { 'payment.status': 'paid', 'payment.txnId': '14444444' });

    // Gọi verify-return để kiểm tra phát hiện trạng thái
    const returnCheck = await vnpayService.verifyReturnUrl({
      vnp_TxnRef: url22.txnRef,
      vnp_SecureHash: 'mock',
    });
    ok(returnCheck.orders.length === 2, 'Tìm thấy đủ cả 2 Order trong nhóm');

    // Chạy IPN đối soát bù trừ
    const reconcileParams = buildSignedVnpParams({
      vnp_TmnCode: config.vnpay.tmnCode,
      vnp_Amount: String((530000 + 830000) * 100),
      vnp_TxnRef: url22.txnRef,
      vnp_ResponseCode: '00',
      vnp_TransactionStatus: '00',
      vnp_TransactionNo: '14444444',
      vnp_CurrCode: 'VND',
    });
    const reconcileRes = await call('GET', `/payment/vnpay/ipn?${toQueryString(reconcileParams)}`);
    ok(reconcileRes.d.RspCode === '00', 'IPN bù trừ thành công');
    const healedOrders = await Order.find({ groupCode: test22.groupCode });
    const bothHealed = healedOrders.every((o) => o.payment.status === 'paid');
    ok(bothHealed, 'Đơn thứ hai được tự động đồng bộ sang paid, triệt tiêu trạng thái dở dang');

    // ==============================================================
    // 23. Chống double-click & tạo trùng giao dịch đồng thời
    // ==============================================================
    section('23. Chống double-click & tạo trùng giao dịch (Anti double-click protection)');
    const test23 = await createOrderGroup(customer1, [{ shop: shop1, product: product1, variant: variant1 }]);
    const firstReq = await call('POST', '/payment/vnpay/create-url', { groupCode: test23.groupCode }, loginC1);
    ok(firstReq.s === 200, 'Lần 1 tạo URL thành công (HTTP 200)');

    const secondReq = await call('POST', '/payment/vnpay/create-url', { groupCode: test23.groupCode }, loginC1);
    ok(secondReq.s === 429, 'Lần 2 (double-click liên tiếp) bị từ chối với HTTP 429');

    // ==============================================================
    // 24. Ma trận nghiệp vụ canRetry cho trang kết quả thanh toán
    // ==============================================================
    section('24. Ma trận canRetry: Cấm nút Thanh toán lại khi đã paid/processing/cancelled');
    // Trường hợp A: Đã thanh toán -> canRetry = false, status = success
    const verifySuccess = await vnpayService.verifyReturnUrl({
      vnp_TxnRef: url13.txnRef,
      vnp_SecureHash: 'mock',
    });
    ok(verifySuccess.status === 'success', 'Đơn đã paid trả về status = success');
    ok(verifySuccess.canRetry === false, 'CẤM hiển thị nút Thanh toán lại khi đơn đã paid (canRetry = false)');

    // Trường hợp B: Giao dịch thất bại nhưng đơn đã hủy -> canRetry = false
    const test24Cancelled = await createOrderGroup(customer1, [{ shop: shop1, product: product1, variant: variant1 }]);
    await Order.updateOne({ _id: test24Cancelled.orders[0]._id }, { status: 'da_huy' });
    const txnFailed = await PaymentTransaction.create({
      txnRef: 'TXN_TEST_CANCELLED_1',
      groupCode: test24Cancelled.groupCode,
      customer: customer1._id,
      orders: [test24Cancelled.orders[0]._id],
      amount: 530000,
      currency: 'VND',
      status: 'failed',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
    const verifyCancelled = await vnpayService.verifyReturnUrl({
      vnp_TxnRef: txnFailed.txnRef,
      vnp_SecureHash: 'mock',
    });
    ok(verifyCancelled.canRetry === false, 'Đơn đã hủy không được phép hiển thị nút Thanh toán lại (canRetry = false)');
  } catch (err) {
    console.error('Lỗi nghiêm trọng trong quá trình chạy test:', err);
    fails.push(err.message);
  } finally {
    if (server) server.close();
  }

  console.log('\n======================================================');
  console.log(`KẾT QUẢ KIỂM THỬ VNPAY SANDBOX:`);
  console.log(`- Số test đạt: ${pass}`);
  console.log(`- Số test thất bại: ${fails.length}`);
  if (fails.length > 0) {
    console.log('Danh sách thất bại:', fails);
  } else {
    console.log('>>> TOÀN BỘ 22 KỊCH BẢN KIỂM THỬ ĐỀU ĐẠT CHUẨN 100% <<<');
  }
  console.log('======================================================\n');

  if (fails.length > 0) {
    process.exitCode = 1;
  }
}

// Chạy trực tiếp nếu file được thực thi bằng node
if (process.argv[1] && process.argv[1].endsWith('vnpay_sandbox.test.js')) {
  runVnpayTestSuite().then(() => {
    process.exit(fails.length > 0 ? 1 : 0);
  });
}
