import { Router } from 'express';
import { z } from 'zod';
import { auth, requireRole } from '../middleware/auth.js';
import { asyncHandler, parse } from '../utils/helpers.js';
import * as vnpayService from '../services/vnpayService.js';

const r = Router();

/**
 * POST /api/payment/vnpay/create-url
 * Khởi tạo giao dịch thanh toán VNPay Sandbox cho nhóm đơn hàng
 * Yêu cầu: Khách hàng đã đăng nhập, sở hữu toàn bộ đơn hàng trong groupCode
 */
r.post(
  '/vnpay/create-url',
  auth,
  requireRole('customer'),
  asyncHandler(async (req, res) => {
    const { groupCode } = parse(
      z.object({
        groupCode: z.string().min(1, 'Thiếu groupCode'),
      }),
      req.body
    );

    const clientIp =
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const result = await vnpayService.createPaymentUrl(req.user, {
      groupCode,
      clientIp,
    });

    res.json(result);
  })
);

/**
 * GET /api/payment/vnpay/ipn
 * Webhook Server-to-Server từ VNPay
 * Không xác thực token JWT, xác thực bảo mật bằng chữ ký HMAC-SHA512
 */
r.get(
  '/vnpay/ipn',
  asyncHandler(async (req, res) => {
    const clientIp =
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const ipnResult = await vnpayService.processIpn(req.query, clientIp);
    res.json(ipnResult);
  })
);

/**
 * GET /api/payment/vnpay/verify-return
 * Xác thực thông tin do trình duyệt khách hàng chuyển hướng về từ VNPay
 * READ-ONLY: Truy vấn trạng thái thực tế từ CSDL, không tự ý cập nhật trạng thái đơn
 */
r.get(
  '/vnpay/verify-return',
  asyncHandler(async (req, res) => {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
    });
    const result = await vnpayService.verifyReturnUrl(req.query);
    res.json(result);
  })
);

/**
 * POST /api/payment/vnpay/check-expiry
 * Kiểm tra và kích hoạt hủy đơn, hoàn tồn kho + voucher nếu giao dịch quá hạn (15 phút)
 */
r.post(
  '/vnpay/check-expiry',
  auth,
  requireRole('customer'),
  asyncHandler(async (req, res) => {
    const { groupCode } = parse(
      z.object({
        groupCode: z.string().min(1, 'Thiếu groupCode'),
      }),
      req.body
    );

    const result = await vnpayService.checkAndExpireGroup(groupCode);
    res.json(result);
  })
);

export default r;
