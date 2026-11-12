import 'dotenv/config';

export default {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce_electronics',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpires: process.env.JWT_EXPIRES || '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  isProd: process.env.NODE_ENV === 'production',

  // ---- Quy tắc nghiệp vụ (có thể chỉnh) ----
  shippingFee: 30000, // phí vận chuyển cố định cho mỗi đơn (mỗi gian hàng)
  returnDays: 7, // số ngày được yêu cầu đổi trả/hoàn tiền kể từ lúc giao hàng
  autoCompleteDays: 3, // tự động "Hoàn tất" sau N ngày kể từ lúc "Đã giao" nếu khách không xác nhận
  pointUnit: 10000, // cứ mỗi 10.000đ (sau giảm giá, chưa tính ship) = 1 điểm
};
