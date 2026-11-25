import crypto from 'node:crypto';
import mongoose from 'mongoose';
import config from '../config.js';
import AppError from '../utils/AppError.js';
import Order from '../models/Order.js';
import { PaymentTransaction } from '../models/PaymentTransaction.js';
import * as orderSvc from './orderService.js';

/**
 * Format Date to yyyyMMddHHmmss for VNPay in GMT+7
 */
export function formatVnpDate(date = new Date()) {
  const gmt7 = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = gmt7.getUTCFullYear();
  const MM = pad(gmt7.getUTCMonth() + 1);
  const dd = pad(gmt7.getUTCDate());
  const HH = pad(gmt7.getUTCHours());
  const mm = pad(gmt7.getUTCMinutes());
  const ss = pad(gmt7.getUTCSeconds());
  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
}

/**
 * Parse VNPay yyyyMMddHHmmss string back to JavaScript Date
 */
export function parseVnpDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.length !== 14) {
    return new Date();
  }
  const yyyy = Number(dateStr.slice(0, 4));
  const MM = Number(dateStr.slice(4, 6)) - 1;
  const dd = Number(dateStr.slice(6, 8));
  const HH = Number(dateStr.slice(8, 10));
  const mm = Number(dateStr.slice(10, 12));
  const ss = Number(dateStr.slice(12, 14));
  // dateStr is GMT+7, subtract 7 hours to get UTC Date
  return new Date(Date.UTC(yyyy, MM, dd, HH - 7, mm, ss));
}

/**
 * Alphabetically sort object keys and encode values according to VNPay official spec
 */
export function sortObject(obj) {
  const sorted = {};
  const str = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (let i = 0; i < str.length; i++) {
    const k = str[i];
    const val = obj[k];
    if (val !== undefined && val !== null && val !== '') {
      sorted[k] = encodeURIComponent(String(val)).replace(/%20/g, '+');
    }
  }
  return sorted;
}

/**
 * Build signData string from sorted object
 */
export function buildSignData(sortedParams) {
  return Object.keys(sortedParams)
    .map((k) => `${k}=${sortedParams[k]}`)
    .join('&');
}

/**
 * Compute HMAC-SHA512 signature using secretKey
 */
export function hmacSha512(data, secretKey) {
  return crypto.createHmac('sha512', secretKey).update(Buffer.from(data, 'utf-8')).digest('hex');
}

/**
 * Verify checksum from VNPay query params
 */
export function verifyChecksum(queryParams, secretKey = config.vnpay.hashSecret) {
  if (!queryParams || typeof queryParams !== 'object') return false;
  const secureHash = queryParams.vnp_SecureHash;
  if (!secureHash) return false;

  const clone = { ...queryParams };
  delete clone.vnp_SecureHash;
  delete clone.vnp_SecureHashType;

  const sorted = sortObject(clone);
  const signData = buildSignData(sorted);
  const computedHash = hmacSha512(signData, secretKey);

  return secureHash.toLowerCase() === computedHash.toLowerCase();
}

/**
 * VNPay Response Code Map
 */
export const VNP_RESPONSE_MESSAGES = {
  '00': 'Giao dịch thành công',
  '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
  '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
  '10': 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.',
  '11': 'Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
  '12': 'Thẻ/Tài khoản của khách hàng bị khóa.',
  '13': 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
  '24': 'Khách hàng hủy giao dịch.',
  '51': 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
  '65': 'Tài khoản của quý khách đã vượt quá hạn mức giao dịch trong ngày.',
  '75': 'Ngân hàng thanh toán đang bảo trì.',
  '79': 'Khách hàng nhập sai mật khẩu thanh toán quá số lần quy định.',
  '99': 'Các lỗi khác (lỗi hệ thống ngân hàng hoặc cổng thanh toán).',
};

export function getVnpErrorMessage(code) {
  return VNP_RESPONSE_MESSAGES[code] || `Lỗi giao dịch không xác định (mã: ${code})`;
}

/**
 * Create VNPay Sandbox Payment URL for a groupCode
 */
export async function createPaymentUrl(user, { groupCode, clientIp = '127.0.0.1' }) {
  if (!groupCode) throw new AppError('Thiếu mã nhóm đơn hàng (groupCode)', 400);

  // 1. Fetch orders in groupCode
  const orders = await Order.find({ groupCode });
  if (!orders.length) throw new AppError('Không tìm thấy đơn hàng nào trong nhóm thanh toán này', 404);

  // 2. Ownership verification: All orders must belong to this customer
  const isOwner = orders.every((o) => String(o.customer) === String(user._id));
  if (!isOwner) throw new AppError('Bạn không có quyền thanh toán cho đơn hàng này', 403);

  // 3. Status verification
  const isCancelled = orders.some((o) => ['da_huy', 'da_tra_hang'].includes(o.status));
  if (isCancelled) throw new AppError('Đơn hàng trong nhóm này đã bị hủy, không thể thanh toán', 400);

  const isAlreadyPaid = orders.every((o) => o.payment.status === 'paid');
  if (isAlreadyPaid) throw new AppError('Đơn hàng này đã được thanh toán thành công trước đó', 400);

  const hasUnpaid = orders.some((o) => o.payment.status === 'unpaid');
  if (!hasUnpaid) throw new AppError('Không có đơn hàng nào cần thanh toán trong nhóm này', 400);

  // 4. Calculate total amount locked from backend data
  const totalAmount = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  if (totalAmount <= 0) throw new AppError('Tổng số tiền thanh toán không hợp lệ', 400);

  // 5. Check if there is an active, unexpired pending transaction for this groupCode
  const now = new Date();
  const expiryMinutes = config.vnpay.expiryMinutes || 15;
  const expiresAt = new Date(now.getTime() + expiryMinutes * 60 * 1000);

  // Anti double-click & active transaction check
  const activeTxn = await PaymentTransaction.findOne({
    groupCode,
    status: { $in: ['pending', 'processing'] },
  }).sort({ createdAt: -1 });

  if (activeTxn) {
    if (activeTxn.status === 'processing') {
      throw new AppError('Giao dịch đang trong tiến trình xử lý từ ngân hàng, vui lòng không tạo giao dịch mới', 409);
    }
    const ageSeconds = (now.getTime() - activeTxn.createdAt.getTime()) / 1000;
    if (ageSeconds < 10) {
      throw new AppError('Hệ thống đang khởi tạo giao dịch, vui lòng chờ trong giây lát và không bấm liên tục', 429);
    }
    // If older than 10s and user is retrying, mark previous abandoned pending transaction as failed
    activeTxn.status = 'failed';
    await activeTxn.save();
  }

  // Generate unique txnRef
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const txnRef = `TXN${timestamp}${randomSuffix}`;

  // 6. Save PaymentTransaction with 'pending' status BEFORE generating URL
  const paymentTxn = await PaymentTransaction.create({
    txnRef,
    groupCode,
    customer: user._id,
    orders: orders.map((o) => o._id),
    amount: totalAmount,
    currency: config.vnpay.currency || 'VND',
    status: 'pending',
    paymentMethod: 'vnpay',
    expiresAt,
  });

  // 7. Format VNPay 2.1.0 parameters
  const createDateStr = formatVnpDate(now);
  const expireDateStr = formatVnpDate(expiresAt);

  // Sanitize IP address (VNPay requires IPv4)
  let cleanIp = clientIp;
  if (cleanIp === '::1' || cleanIp.includes(':')) {
    cleanIp = '127.0.0.1';
  }

  const vnpParams = {
    vnp_Version: config.vnpay.version || '2.1.0',
    vnp_Command: config.vnpay.command || 'pay',
    vnp_TmnCode: config.vnpay.tmnCode,
    vnp_Amount: Math.round(totalAmount * 100),
    vnp_CreateDate: createDateStr,
    vnp_CurrCode: config.vnpay.currency || 'VND',
    vnp_IpAddr: cleanIp,
    vnp_Locale: 'vn',
    vnp_OrderInfo: `Thanh toan don hang ${groupCode}`,
    vnp_OrderType: 'other',
    vnp_ReturnUrl: config.vnpay.returnUrl,
    vnp_TxnRef: txnRef,
    vnp_ExpireDate: expireDateStr,
  };

  // 8. Sort and sign with HMAC-SHA512
  const sorted = sortObject(vnpParams);
  const signData = buildSignData(sorted);
  const secureHash = hmacSha512(signData, config.vnpay.hashSecret);
  sorted.vnp_SecureHash = secureHash;

  const paymentUrl = `${config.vnpay.url}?${buildSignData(sorted)}`;

  return {
    paymentUrl,
    txnRef,
    groupCode,
    amount: totalAmount,
    expiresAt,
  };
}

/**
 * Safe consistent update helper across PaymentTransaction and all group Orders
 * Handles MongoDB transactions when available, falls back to safe compensation.
 */
async function updatePaymentStatus(paymentTxn, orders, vnpParams, isSuccess) {
  // Check if replica set multi-document transaction is supported
  const isReplicaSet = mongoose.connection.client?.topology?.description?.type === 'ReplicaSetWithPrimary';

  if (isReplicaSet) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        if (isSuccess) {
          await PaymentTransaction.updateOne(
            { _id: paymentTxn._id },
            {
              $set: {
                status: 'success',
                vnpTransactionNo: vnpParams.vnp_TransactionNo,
                responseCode: vnpParams.vnp_ResponseCode,
                transactionStatus: vnpParams.vnp_TransactionStatus,
                bankCode: vnpParams.vnp_BankCode,
                bankTranNo: vnpParams.vnp_BankTranNo,
                cardType: vnpParams.vnp_CardType,
                payDate: parseVnpDate(vnpParams.vnp_PayDate) || new Date(),
              },
            },
            { session }
          );

          for (const o of orders) {
            await Order.updateOne(
              { _id: o._id },
              {
                $set: {
                  'payment.status': 'paid',
                  'payment.paidAt': parseVnpDate(vnpParams.vnp_PayDate) || new Date(),
                  'payment.txnId': vnpParams.vnp_TransactionNo,
                },
              },
              { session }
            );
          }
        } else {
          await PaymentTransaction.updateOne(
            { _id: paymentTxn._id },
            {
              $set: {
                status: 'failed',
                vnpTransactionNo: vnpParams.vnp_TransactionNo,
                responseCode: vnpParams.vnp_ResponseCode,
                transactionStatus: vnpParams.vnp_TransactionStatus,
                failureReason: getVnpErrorMessage(vnpParams.vnp_ResponseCode),
              },
            },
            { session }
          );
        }
      });
    } finally {
      await session.endSession();
    }
  } else {
    // Non-replica set / Standalone environment: Two-phase compensated consistency
    const payDate = parseVnpDate(vnpParams.vnp_PayDate) || new Date();
    if (isSuccess) {
      await PaymentTransaction.updateOne(
        { _id: paymentTxn._id },
        { $set: { status: 'processing' } }
      );

      const updatedOrderIds = [];
      try {
        for (const o of orders) {
          await Order.updateOne(
            { _id: o._id },
            {
              $set: {
                'payment.status': 'paid',
                'payment.paidAt': payDate,
                'payment.txnId': vnpParams.vnp_TransactionNo,
              },
            }
          );
          updatedOrderIds.push(o._id);
        }

        await PaymentTransaction.updateOne(
          { _id: paymentTxn._id },
          {
            $set: {
              status: 'success',
              vnpTransactionNo: vnpParams.vnp_TransactionNo,
              responseCode: vnpParams.vnp_ResponseCode,
              transactionStatus: vnpParams.vnp_TransactionStatus,
              bankCode: vnpParams.vnp_BankCode,
              bankTranNo: vnpParams.vnp_BankTranNo,
              cardType: vnpParams.vnp_CardType,
              payDate,
            },
          }
        );
      } catch (err) {
        // Recovery mechanism: Complete updating remaining orders if partially completed
        console.error('[vnpayService] Lỗi khi cập nhật danh sách đơn hàng:', err.message);
        for (const o of orders) {
          if (!updatedOrderIds.includes(o._id)) {
            await Order.updateOne(
              { _id: o._id },
              {
                $set: {
                  'payment.status': 'paid',
                  'payment.paidAt': payDate,
                  'payment.txnId': vnpParams.vnp_TransactionNo,
                },
              }
            ).catch((e) => console.error('[vnpayService] Recovery failed for order:', o._id, e.message));
          }
        }
        await PaymentTransaction.updateOne(
          { _id: paymentTxn._id },
          { $set: { status: 'success' } }
        );
        throw err;
      }
    } else {
      await PaymentTransaction.updateOne(
        { _id: paymentTxn._id },
        {
          $set: {
            status: 'failed',
            vnpTransactionNo: vnpParams.vnp_TransactionNo,
            responseCode: vnpParams.vnp_ResponseCode,
            transactionStatus: vnpParams.vnp_TransactionStatus,
            failureReason: getVnpErrorMessage(vnpParams.vnp_ResponseCode),
          },
        }
      );
    }
  }
}

/**
 * Handle VNPay Instant Payment Notification (IPN) server-to-server webhook
 */
export async function processIpn(vnpParams, clientIp = '') {
  // 1. Verify Checksum FIRST before any business logic
  const isSignatureValid = verifyChecksum(vnpParams, config.vnpay.hashSecret);
  if (!isSignatureValid) {
    return { RspCode: '97', Message: 'Invalid Checksum' };
  }

  // 2. Validate TmnCode if configured
  if (config.vnpay.tmnCode && vnpParams.vnp_TmnCode && vnpParams.vnp_TmnCode !== config.vnpay.tmnCode) {
    return { RspCode: '01', Message: 'Order not found' };
  }

  const txnRef = vnpParams.vnp_TxnRef;
  if (!txnRef) {
    return { RspCode: '01', Message: 'Order not found' };
  }

  // 3. Find PaymentTransaction by txnRef (NEVER split string to parse groupCode)
  const paymentTxn = await PaymentTransaction.findOne({ txnRef });
  if (!paymentTxn) {
    return { RspCode: '01', Message: 'Order not found' };
  }

  // Helper to record IPN logs atomically
  const logIpnResult = async (resultObj) => {
    await PaymentTransaction.updateOne(
      { _id: paymentTxn._id },
      {
        $push: {
          ipnLogs: {
            receivedAt: new Date(),
            params: vnpParams,
            result: resultObj,
            ip: clientIp,
          },
        },
      }
    ).catch(() => {});
  };

  // 4. Verify Amount: vnp_Amount is multiplied by 100
  const vnpAmount = Math.round(Number(vnpParams.vnp_Amount) / 100);
  if (vnpAmount !== Math.round(paymentTxn.amount)) {
    const res = { RspCode: '04', Message: 'Invalid Amount' };
    await logIpnResult(res);
    return res;
  }

  // 5. Verify Currency
  if (vnpParams.vnp_CurrCode && vnpParams.vnp_CurrCode !== paymentTxn.currency) {
    const res = { RspCode: '04', Message: 'Invalid Currency' };
    await logIpnResult(res);
    return res;
  }

  // 6. Find all Orders for this groupCode
  const orders = await Order.find({ groupCode: paymentTxn.groupCode });
  if (!orders.length) {
    const res = { RspCode: '01', Message: 'Order not found' };
    await logIpnResult(res);
    return res;
  }

  // 7. Idempotency Check: Already confirmed
  if (paymentTxn.status === 'success' || orders.every((o) => o.payment.status === 'paid')) {
    const res = { RspCode: '02', Message: 'Order already confirmed' };
    await logIpnResult(res);
    return res;
  }

  // 8. Expiration or Cancellation check: Do not revive cancelled/expired orders
  if (paymentTxn.status === 'expired' || orders.some((o) => ['da_huy', 'da_tra_hang'].includes(o.status))) {
    const res = { RspCode: '02', Message: 'Order already confirmed' }; // Order closed
    await logIpnResult(res);
    return res;
  }

  // 9. Atomic Lock: Acquire processing state to prevent concurrent double-execution
  const lock = await PaymentTransaction.updateOne(
    { _id: paymentTxn._id, status: { $in: ['pending', 'failed'] } },
    { $set: { status: 'processing' } }
  );

  if (lock.modifiedCount === 0) {
    // Another concurrent thread already acquired the lock and is updating
    for (let attempt = 0; attempt < 15; attempt++) {
      await new Promise((r) => setTimeout(r, 40));
      const refreshed = await PaymentTransaction.findById(paymentTxn._id);
      if (refreshed?.status === 'success') {
        const res = { RspCode: '02', Message: 'Order already confirmed' };
        await logIpnResult(res);
        return res;
      }
    }
    const res = { RspCode: '02', Message: 'Order already confirmed' };
    await logIpnResult(res);
    return res;
  }

  // 10. Check VNPay success codes: both vnp_ResponseCode === '00' AND vnp_TransactionStatus === '00'
  const isSuccess = vnpParams.vnp_ResponseCode === '00' && vnpParams.vnp_TransactionStatus === '00';

  await updatePaymentStatus(paymentTxn, orders, vnpParams, isSuccess);

  const res = { RspCode: '00', Message: 'Confirm Success' };
  await logIpnResult(res);

  return res;
}

/**
 * Verify Return URL query params from client redirect (READ-ONLY check, never updates DB directly)
 */
export async function verifyReturnUrl(queryParams) {
  const isSignatureValid = verifyChecksum(queryParams, config.vnpay.hashSecret);
  const txnRef = queryParams.vnp_TxnRef;

  if (!txnRef) {
    return {
      isValid: isSignatureValid,
      status: 'failed',
      message: 'Thiếu mã tham chiếu giao dịch (vnp_TxnRef)',
    };
  }

  const paymentTxn = await PaymentTransaction.findOne({ txnRef });
  if (!paymentTxn) {
    return {
      isValid: isSignatureValid,
      status: 'failed',
      message: 'Không tìm thấy thông tin giao dịch trong hệ thống',
    };
  }

  const orders = await Order.find({ groupCode: paymentTxn.groupCode }).select('code total payment status shop items');
  const isPaid = orders.length > 0 && orders.every((o) => o.payment.status === 'paid');
  const isCancelled = orders.some((o) => ['da_huy', 'da_tra_hang'].includes(o.status));
  const hasUnpaid = orders.length > 0 && orders.some((o) => o.payment.status === 'unpaid');
  const isExpired = new Date() > paymentTxn.expiresAt;

  let finalStatus = paymentTxn.status;
  if (isPaid) {
    finalStatus = 'success';
  } else if (isExpired && finalStatus !== 'success') {
    finalStatus = 'expired';
  } else if (queryParams.vnp_ResponseCode && queryParams.vnp_ResponseCode !== '00' && finalStatus !== 'success') {
    finalStatus = 'failed';
  }

  const responseCode = queryParams.vnp_ResponseCode || paymentTxn.responseCode;
  const transactionStatus = queryParams.vnp_TransactionStatus || paymentTxn.transactionStatus;

  // Xác định liệu chính cổng VNPay trong phiên này có trả kết quả thành công hợp lệ không
  const vnpayReportedSuccess = Boolean(
    isSignatureValid &&
    (queryParams.vnp_ResponseCode === '00') &&
    (!queryParams.vnp_TransactionStatus || queryParams.vnp_TransactionStatus === '00')
  );

  // Quyết định quyền retry: Chỉ được phép khi giao dịch thất bại thật, đơn chưa hủy, còn đơn unpaid và không trong tiến trình xử lý
  const canRetry = Boolean(
    finalStatus === 'failed' &&
    orders.length > 0 &&
    !isCancelled &&
    hasUnpaid &&
    paymentTxn.status !== 'processing'
  );

  return {
    isValid: isSignatureValid,
    vnpayReportedSuccess,
    isOrderPaid: isPaid,
    status: finalStatus,
    groupCode: paymentTxn.groupCode,
    txnRef: paymentTxn.txnRef,
    amount: paymentTxn.amount,
    currency: paymentTxn.currency,
    responseCode,
    transactionStatus,
    bankCode: paymentTxn.bankCode || queryParams.vnp_BankCode || 'NCB',
    bankTranNo: paymentTxn.bankTranNo || queryParams.vnp_BankTranNo,
    vnpTransactionNo: paymentTxn.vnpTransactionNo || queryParams.vnp_TransactionNo,
    payDate: paymentTxn.payDate,
    canRetry,
    message: isSignatureValid
      ? isPaid
        ? 'Thanh toán thành công – Đơn hàng đã được xác nhận'
        : vnpayReportedSuccess
          ? 'VNPay đã báo thanh toán thành công, hệ thống đang đồng bộ xác nhận đơn hàng'
          : getVnpErrorMessage(responseCode)
      : 'Chữ ký phản hồi không hợp lệ (Invalid Checksum)',
    orders: orders.map((o) => ({
      _id: o._id,
      code: o.code,
      total: o.total,
      paymentStatus: o.payment.status,
      status: o.status,
    })),
  };
}

/**
 * Handle Order Expiry: Cancels orders and restores stock + vouchers if expired and unpaid
 */
export async function checkAndExpireGroup(groupCode) {
  const paymentTxn = await PaymentTransaction.findOne({ groupCode }).sort({ createdAt: -1 });
  const orders = await Order.find({ groupCode });

  if (!orders.length) return null;

  const isPaid = orders.every((o) => o.payment.status === 'paid');
  if (isPaid) return { status: 'paid', message: 'Đơn đã được thanh toán' };

  const isAlreadyCancelled = orders.every((o) => o.status === 'da_huy');
  if (isAlreadyCancelled) return { status: 'cancelled', message: 'Đơn đã bị hủy trước đó' };

  const now = new Date();
  if (paymentTxn && paymentTxn.expiresAt < now && paymentTxn.status === 'pending') {
    paymentTxn.status = 'expired';
    await paymentTxn.save();

    for (const o of orders) {
      if (o.payment.status === 'unpaid' && o.status === 'cho_xac_nhan') {
        await orderSvc.cancelOrder(o, null, 'Hết hạn thời gian thanh toán VNPay (quá 15 phút)');
      }
    }

    return { status: 'expired', message: 'Đã hủy nhóm đơn và hoàn lại tồn kho, voucher thành công' };
  }

  return { status: paymentTxn?.status || 'pending', message: 'Giao dịch chưa hết hạn' };
}
