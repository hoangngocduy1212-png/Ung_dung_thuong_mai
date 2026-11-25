import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

// Chạy từ server/ hoặc thư mục gốc đều đọc được cấu hình dự án.
// Biến môi trường được truyền trực tiếp (ví dụ DB tạm khi test) luôn được ưu tiên.
dotenv.config({ path: [fileURLToPath(new URL('../.env', import.meta.url)), fileURLToPath(new URL('../../.env', import.meta.url))], quiet: true });

export default {
  port: Number(process.env.PORT) || 5001,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce_electronics_lab',
  dbName: process.env.NODE_ENV === 'test' ? undefined : (process.env.MONGODB_DB_NAME || 'ecommerce_electronics_lab'),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpires: process.env.JWT_EXPIRES || '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5174',
  isProd: process.env.NODE_ENV === 'production',

  // ---- Quy tắc nghiệp vụ (có thể chỉnh) ----
  shippingFee: 30000, // phí vận chuyển cố định cho mỗi đơn (mỗi gian hàng)
  returnDays: 7, // số ngày được yêu cầu đổi trả/hoàn tiền kể từ lúc giao hàng
  autoCompleteDays: 3, // tự động "Hoàn tất" sau N ngày kể từ lúc "Đã giao" nếu khách không xác nhận
  pointUnit: 10000, // cứ mỗi 10.000đ (sau giảm giá, chưa tính ship) = 1 điểm

  // ---- Cấu hình VNPay Sandbox ----
  vnpay: {
    tmnCode: process.env.VNPAY_TMN_CODE || '',
    hashSecret: process.env.VNPAY_HASH_SECRET || '',
    url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    returnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:5174/payment/vnpay/callback',
    ipnUrl: process.env.VNPAY_IPN_URL || 'http://localhost:5001/api/payment/vnpay/ipn',
    version: process.env.VNPAY_VERSION || '2.1.0',
    command: process.env.VNPAY_COMMAND || 'pay',
    currency: process.env.VNPAY_CURRENCY || 'VND',
    expiryMinutes: Number(process.env.VNPAY_EXPIRY_MINUTES) || 15,
  },
};
