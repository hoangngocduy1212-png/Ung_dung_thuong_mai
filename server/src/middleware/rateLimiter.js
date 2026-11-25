import AppError from '../utils/AppError.js';

/**
 * In-memory sliding window rate limiter
 * Thích hợp cho môi trường đơn instance (Single Instance Node.js server / Cloudflare Tunnel).
 * Lưu ý: Trong môi trường nhiều instance (Horizontal scaling), cần nâng cấp sang Redis / Memcached
 * hoặc cấu hình rate limiting tại lớp Gateway / Cloudflare WAF để chia sẻ bộ đếm giữa các worker.
 */

export class MemoryStore {
  constructor(cleanupIntervalMs = 60000) {
    this.hits = new Map(); // key -> [timestamps]
    this.timer = setInterval(() => this.cleanup(), cleanupIntervalMs);
    if (this.timer.unref) this.timer.unref(); // Không chặn tiến trình Node thoát
  }

  record(key, now, windowMs) {
    const cutoff = now - windowMs;
    let timestamps = this.hits.get(key) || [];
    timestamps = timestamps.filter((t) => t > cutoff);
    timestamps.push(now);
    this.hits.set(key, timestamps);
    return timestamps.length;
  }

  get(key, now, windowMs) {
    const cutoff = now - windowMs;
    const timestamps = this.hits.get(key) || [];
    return timestamps.filter((t) => t > cutoff).length;
  }

  reset() {
    this.hits.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.hits.entries()) {
      const valid = timestamps.filter((t) => t > now - 3600000);
      if (valid.length === 0) {
        this.hits.delete(key);
      } else {
        this.hits.set(key, valid);
      }
    }
  }
}

export const defaultStore = new MemoryStore();

/**
 * Trích xuất Client IP an toàn:
 * - Khi chạy sau Cloudflare Tunnel / Reverse proxy, header `cf-connecting-ip` được Cloudflare đảm bảo tính xác thực.
 * - Chỉ tin tưởng req.ip hoặc X-Forwarded-For khi trust proxy được bật trên Express app.
 * - Tuyệt đối không tin tưởng header X-Forwarded-For tùy tiện nếu chưa qua proxy tin cậy.
 */
export function getSafeClientIp(req) {
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp && typeof cfIp === 'string') {
    return cfIp.trim();
  }

  if (req.app && req.app.get('trust proxy')) {
    return req.ip || req.socket?.remoteAddress || '127.0.0.1';
  }

  return req.socket?.remoteAddress || '127.0.0.1';
}

/**
 * Middleware tạo Rate Limiter
 * @param {Object} options
 * @param {number} options.windowMs - Khoảng thời gian tính (ms)
 * @param {number} options.max - Số request tối đa trong windowMs
 * @param {string} options.message - Thông báo lỗi thân thiện tiếng Việt khi bị limit
 * @param {string} options.prefix - Tiền tố phân biệt giữa các endpoint
 * @param {MemoryStore} [options.store] - Store lưu trữ
 */
export function createRateLimiter(options) {
  const {
    windowMs = 15 * 60 * 1000,
    max = 30,
    message = 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.',
    prefix = 'rl',
    store = defaultStore,
  } = options;

  return function rateLimiterMiddleware(req, res, next) {
    const isTestMode = process.env.NODE_ENV === 'test';
    const isExplicitRateLimitTest = req.headers['x-test-rate-limit'] === 'true';

    // Trong test suite mặc định bypass để không ảnh hưởng 500+ test case chạy song song,
    // TRỪ KHI request mang cờ kiểm thử chuyên biệt 'x-test-rate-limit': 'true'.
    if (isTestMode && !isExplicitRateLimitTest) {
      return next();
    }

    const ip = getSafeClientIp(req);
    const key = `${prefix}:${ip}`;
    const now = Date.now();

    // Với bài test cụ thể 'x-test-rate-limit': 'true', hạ max xuống 5 để test nhanh trong môi trường test
    const effectiveMax = isExplicitRateLimitTest ? 5 : max;

    const count = store.record(key, now, windowMs);
    const remaining = Math.max(0, effectiveMax - count);
    const resetTimeSec = Math.ceil(windowMs / 1000);

    res.setHeader('RateLimit-Limit', effectiveMax);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', resetTimeSec);

    if (count > effectiveMax) {
      res.setHeader('Retry-After', resetTimeSec);
      if (process.env.NODE_ENV !== 'test') {
        // Cảnh báo an ninh: Không log mật khẩu hay thông tin nhạy cảm
        console.warn(
          `[Security] Rate limit exceeded on ${req.method} ${req.path} from IP: ${ip} (Hits: ${count}/${effectiveMax})`
        );
      }
      return res.status(429).json({
        status: 429,
        message,
        retryAfter: resetTimeSec,
      });
    }

    next();
  };
}

// 1. Rate limiter cho đăng nhập:
// 30 lượt thử / 15 phút trên mỗi IP (phù hợp với người dùng mạng NAT/4G/công ty tại VN)
export const loginRateLimiter = createRateLimiter({
  prefix: 'auth_login',
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Bạn đã thử đăng nhập quá nhiều lần từ địa chỉ này. Vui lòng thử lại sau 15 phút.',
});

// 2. Rate limiter cho đăng ký khách hàng:
// 10 lần đăng ký / 1 giờ trên mỗi IP (chống spam bot tạo tài khoản)
export const registerRateLimiter = createRateLimiter({
  prefix: 'auth_reg_customer',
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Bạn đã đăng ký quá nhiều tài khoản trong thời gian ngắn. Vui lòng thử lại sau 1 giờ.',
});

// 3. Rate limiter cho đăng ký chủ shop / nhân viên:
// 10 lần gửi yêu cầu / 1 giờ trên mỗi IP
export const registerSellerRateLimiter = createRateLimiter({
  prefix: 'auth_reg_seller',
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Bạn đã gửi yêu cầu đăng ký gian hàng quá nhiều lần. Vui lòng thử lại sau 1 giờ.',
});
