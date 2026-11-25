import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { customerService } from '../../services/customerService';
import type { VNPayVerifyResult } from '../../types/order';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Package,
  CreditCard,
  Building2,
  Calendar,
  Hash,
  ShoppingBag,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

const MAX_POLL_ATTEMPTS = 5;
const POLL_INTERVAL_MS = 3000;

export const VNPayReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VNPayVerifyResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [isPollingFinished, setIsPollingFinished] = useState(false);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isComponentMounted = useRef(true);

  const clearTimer = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const getParamsObject = useCallback(() => {
    const paramsObj: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      paramsObj[key] = val;
    });
    return paramsObj;
  }, [searchParams]);

  const executeVerification = useCallback(
    async (paramsObj: Record<string, string>, currentCount: number) => {
      try {
        const res = await customerService.verifyVNPayReturn(paramsObj);
        if (!isComponentMounted.current) return;

        setVerifyResult(res);
        setLoading(false);

        // If order confirmed paid by IPN or definitively failed/expired -> stop polling
        if (res.isOrderPaid || res.status === 'success' || res.status === 'failed' || res.status === 'expired') {
          clearTimer();
          setIsPollingFinished(true);
          return;
        }

        // If polling limit reached
        if (currentCount >= MAX_POLL_ATTEMPTS) {
          clearTimer();
          setIsPollingFinished(true);
        }
      } catch (err: any) {
        if (!isComponentMounted.current) return;
        console.error('Verify VNPay error:', err);
        if (currentCount === 0) {
          setErrorMsg(err?.message || 'Không thể kết nối đến máy chủ để xác thực kết quả giao dịch.');
          setLoading(false);
          clearTimer();
        }
      }
    },
    []
  );

  useEffect(() => {
    isComponentMounted.current = true;
    const paramsObj = getParamsObject();

    if (Object.keys(paramsObj).length === 0) {
      setLoading(false);
      setErrorMsg('Không tìm thấy tham số phản hồi từ cổng thanh toán VNPay.');
      return;
    }

    // Initial query
    executeVerification(paramsObj, 0);

    // Controlled polling (3 seconds per interval, max 5 attempts = 15 seconds)
    let attempts = 0;
    pollTimerRef.current = setInterval(() => {
      attempts += 1;
      setPollCount(attempts);
      executeVerification(paramsObj, attempts);
      if (attempts >= MAX_POLL_ATTEMPTS) {
        clearTimer();
        setIsPollingFinished(true);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      isComponentMounted.current = false;
      clearTimer();
    };
  }, [getParamsObject, executeVerification]);

  // Manual refresh button handler
  const handleManualRefresh = async () => {
    const paramsObj = getParamsObject();
    if (Object.keys(paramsObj).length === 0 || isManualRefreshing) return;
    try {
      setIsManualRefreshing(true);
      const res = await customerService.verifyVNPayReturn(paramsObj);
      setVerifyResult(res);
      if (res.isOrderPaid || res.status === 'success') {
        setIsPollingFinished(true);
      }
    } catch (err) {
      console.error('Manual refresh error:', err);
    } finally {
      setTimeout(() => {
        setIsManualRefreshing(false);
      }, 500);
    }
  };

  const handleRetryPayment = async () => {
    if (!verifyResult?.groupCode || isRetrying) return;
    try {
      setIsRetrying(true);
      const res = await customerService.createVNPayUrl(verifyResult.groupCode);
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } catch (err: any) {
      alert(err?.message || 'Không thể tạo lại liên kết thanh toán. Đơn hàng có thể đã quá hạn hoặc đang được xử lý.');
      setIsRetrying(false);
    }
  };

  const formatPrice = (val?: number) => {
    if (typeof val !== 'number') return '0 ₫';
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  const formatPayDate = (dStr?: string | null) => {
    if (!dStr) return 'Vừa xong';
    if (dStr.length === 14) {
      const yyyy = dStr.slice(0, 4);
      const mm = dStr.slice(4, 6);
      const dd = dStr.slice(6, 8);
      const hh = dStr.slice(8, 10);
      const mi = dStr.slice(10, 12);
      const ss = dStr.slice(12, 14);
      return `${hh}:${mi}:${ss} — ${dd}/${mm}/${yyyy}`;
    }
    try {
      const d = new Date(dStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString('vi-VN');
      }
    } catch {
      // fallback
    }
    return dStr;
  };

  // Evaluated status variables
  const rawResponseCode = searchParams.get('vnp_ResponseCode');
  const vnpTxnRef = searchParams.get('vnp_TxnRef') || verifyResult?.txnRef;
  const vnpTransactionNo = verifyResult?.vnpTransactionNo || searchParams.get('vnp_TransactionNo');
  const vnpBankCode = verifyResult?.bankCode || searchParams.get('vnp_BankCode') || 'NCB';
  const vnpPayDate = verifyResult?.payDate || searchParams.get('vnp_PayDate');
  const primaryOrderCode = verifyResult?.orders?.[0]?.code;

  // Key state flags
  const isOrderFullyPaid = Boolean(verifyResult?.isOrderPaid || verifyResult?.status === 'success');
  const isVnpayReportedSuccess = Boolean(
    verifyResult?.vnpayReportedSuccess ||
      (verifyResult?.isValid && (rawResponseCode === '00' || !rawResponseCode))
  );
  const isExpired = verifyResult?.status === 'expired';

  return (
    <div
      className="min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 max-w-[840px] mx-auto font-sans"
      data-purpose="vnpay-return-container"
    >
      <AnimatePresence mode="wait">
        {/* ===================== 0. LOADING BANNER ===================== */}
        {loading ? (
          <motion.div
            key="initial-loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="bg-white border border-[#E5E5E5] rounded-2xl p-12 text-center shadow-xs space-y-4"
          >
            <div className="w-12 h-12 border-3 border-neutral-200 border-t-[#171717] rounded-full animate-spin mx-auto" />
            <h2 className="text-xl font-extrabold text-[#171717] font-display tracking-tight">
              Đang xác minh giao dịch...
            </h2>
            <p className="text-xs text-[#737373] max-w-md mx-auto leading-relaxed">
              Hệ thống TECHSTORE đang đối chiếu kết quả phản hồi với cổng thanh toán VNPay Sandbox.
            </p>
          </motion.div>
        ) : errorMsg || !verifyResult ? (
          /* ===================== ERROR STATE (INVALID PARAMS OR CONNECTION) ===================== */
          <motion.div
            key="system-error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white border border-[#E5E5E5] rounded-2xl p-8 sm:p-10 text-center shadow-xs space-y-6"
          >
            <div className="w-14 h-14 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-mono font-bold tracking-wider uppercase">
                XÁC THỰC THẤT BẠI
              </span>
              <h1 className="text-2xl font-extrabold text-[#171717] font-display tracking-tight">
                Không thể xác thực giao dịch
              </h1>
              <p className="text-xs sm:text-sm text-[#737373] max-w-md mx-auto leading-relaxed">
                {errorMsg || 'Không thể tải thông tin giao dịch.'}
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/account/orders"
                className="w-full sm:w-auto px-6 py-2.5 bg-[#171717] hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <span>Xem danh sách đơn hàng</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/"
                className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-neutral-50 text-[#171717] border border-[#E5E5E5] text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <span>Về trang chủ</span>
              </Link>
            </div>
          </motion.div>
        ) : isOrderFullyPaid ? (
          /* ===================== TRẠNG THÁI C: IPN XÁC NHẬN THÀNH CÔNG HOÀN TOÀN ===================== */
          <motion.div
            key="state-fully-paid"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="bg-white border border-[#E5E5E5] rounded-2xl shadow-xs overflow-hidden"
          >
            {/* Hero Section */}
            <div className="p-8 sm:p-10 border-b border-[#E5E5E5] bg-[#F5F5F5]/60 text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-[#ECFDF5] border border-[#BBF7D0] text-[#15803D] flex items-center justify-center mx-auto shadow-xs"
              >
                <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
              </motion.div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#BBF7D0] text-[#15803D] text-[11px] font-mono font-bold tracking-wider uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ĐÃ XÁC NHẬN ĐƠN HÀNG</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight font-display">
                  Thanh toán thành công – Đơn hàng đã được xác nhận.
                </h1>
                <p className="text-xs sm:text-sm text-[#737373] max-w-lg mx-auto leading-relaxed">
                  Cảm ơn bạn đã mua sắm tại TECHSTORE. Giao dịch đã được hệ thống xác nhận thanh toán thành công và đơn hàng đang được chuẩn bị.
                </p>
              </div>
            </div>

            {/* Transaction Summary Card */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Highlight Total Amount */}
              <div className="p-5 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-[#737373] uppercase tracking-wider block font-mono">
                    TỔNG TIỀN ĐÃ THANH TOÁN
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#171717] font-mono tracking-tight mt-0.5 block">
                    {formatPrice(verifyResult.amount)}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-[#737373] font-medium block">Phương thức</span>
                  <span className="text-xs font-bold text-[#171717] mt-0.5 inline-flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#FF5C00]" />
                    <span>Cổng VNPay (Thẻ ATM nội địa)</span>
                  </span>
                </div>
              </div>

              {/* Technical Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {primaryOrderCode && (
                  <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white space-y-1">
                    <span className="text-[#737373] font-medium flex items-center gap-1.5 text-[11px]">
                      <Package className="w-3.5 h-3.5 text-neutral-400" />
                      Mã đơn hàng
                    </span>
                    <span className="font-mono font-bold text-[#171717] block text-sm">
                      {primaryOrderCode}
                    </span>
                  </div>
                )}

                {verifyResult.groupCode && (
                  <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white space-y-1">
                    <span className="text-[#737373] font-medium flex items-center gap-1.5 text-[11px]">
                      <Hash className="w-3.5 h-3.5 text-neutral-400" />
                      Mã nhóm đơn (Group Code)
                    </span>
                    <span className="font-mono font-bold text-[#171717] block text-sm">
                      {verifyResult.groupCode}
                    </span>
                  </div>
                )}

                {vnpTxnRef && (
                  <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white space-y-1">
                    <span className="text-[#737373] font-medium flex items-center gap-1.5 text-[11px]">
                      <Hash className="w-3.5 h-3.5 text-neutral-400" />
                      Mã tham chiếu (TxnRef)
                    </span>
                    <span className="font-mono font-semibold text-[#171717] block truncate">
                      {vnpTxnRef}
                    </span>
                  </div>
                )}

                {vnpTransactionNo && (
                  <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white space-y-1">
                    <span className="text-[#737373] font-medium flex items-center gap-1.5 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                      Mã giao dịch VNPay
                    </span>
                    <span className="font-mono font-semibold text-[#171717] block truncate">
                      {vnpTransactionNo}
                    </span>
                  </div>
                )}

                {vnpBankCode && (
                  <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white space-y-1">
                    <span className="text-[#737373] font-medium flex items-center gap-1.5 text-[11px]">
                      <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                      Ngân hàng thanh toán
                    </span>
                    <span className="font-bold text-[#171717] block">
                      {vnpBankCode}
                    </span>
                  </div>
                )}

                <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white space-y-1">
                  <span className="text-[#737373] font-medium flex items-center gap-1.5 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    Thời gian giao dịch
                  </span>
                  <span className="font-medium text-[#171717] block">
                    {formatPayDate(vnpPayDate)}
                  </span>
                </div>
              </div>

              {/* Order breakdown list if multiple orders */}
              {verifyResult.orders && verifyResult.orders.length > 1 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-[#737373] font-mono">
                    <span>DANH SÁCH ĐƠN HÀNG TRONG NHÓM</span>
                    <span>{verifyResult.orders.length} đơn</span>
                  </div>
                  <div className="divide-y divide-[#E5E5E5] border border-[#E5E5E5] rounded-xl overflow-hidden bg-white">
                    {verifyResult.orders.map((o) => (
                      <div key={o._id} className="p-3.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <Package className="w-4 h-4 text-neutral-400 shrink-0" />
                          <span className="font-mono font-bold text-[#171717]">{o.code}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-[#171717]">{formatPrice(o.total)}</span>
                          <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#15803D] text-[10px] font-bold rounded">
                            Đã thanh toán
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA BUTTONS: CHỈ ĐƯỢC PHÉP CÓ HAI NÚT (KHÔNG CÓ NÚT THANH TOÁN LẠI) */}
              <div className="pt-4 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-end gap-3">
                <Link
                  to="/products"
                  className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-neutral-50 text-[#171717] border border-[#E5E5E5] text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Tiếp tục mua sắm</span>
                </Link>
                <Link
                  to="/account/orders"
                  className="w-full sm:w-auto px-6 py-3 bg-[#171717] hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Xem đơn hàng</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        ) : isVnpayReportedSuccess ? (
          /* ===================== TRẠNG THÁI A / B: VNPAY BÁO THÀNH CÔNG (ĐANG CHỜ / ĐÃ HẾT 15S CHỜ IPN) ===================== */
          <motion.div
            key="state-vnpay-acknowledged"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="bg-white border border-[#E5E5E5] rounded-2xl shadow-xs overflow-hidden"
          >
            {/* Header: Reassuring Positive Green Badge */}
            <div className="p-8 sm:p-10 border-b border-[#E5E5E5] bg-[#F5F5F5]/60 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#ECFDF5] border border-[#BBF7D0] text-[#15803D] flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#BBF7D0] text-[#15803D] text-[11px] font-mono font-bold tracking-wider uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>VNPAY ĐÃ XÁC NHẬN</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight font-display">
                  VNPay đã báo thanh toán thành công!
                </h1>
                <p className="text-xs sm:text-sm text-[#737373] max-w-lg mx-auto leading-relaxed">
                  Chúng tôi đã nhận được kết quả giao dịch thành công từ VNPay. TECHSTORE đang đồng bộ xác nhận đơn hàng. Bạn không cần thực hiện thanh toán lại.
                </p>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Dynamic Synchronization Notification Box */}
              {!isPollingFinished ? (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-amber-800 rounded-full animate-spin shrink-0" />
                    <span>
                      Hệ thống đang đồng bộ xác nhận đơn hàng với máy chủ thanh toán... (Lần {pollCount}/{MAX_POLL_ATTEMPTS})
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-amber-700 shrink-0">ĐANG XỬ LÝ</span>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-neutral-50 border border-[#E5E5E5] text-xs text-[#737373] leading-relaxed space-y-1">
                  <div className="flex items-center gap-2 text-neutral-900 font-bold">
                    <Clock className="w-4 h-4 text-neutral-600 shrink-0" />
                    <span>Giao dịch đã được VNPay báo thành công</span>
                  </div>
                  <p>
                    TECHSTORE đang chờ xác nhận cuối cùng từ hệ thống thanh toán. Bạn không cần thanh toán lại. Bạn có thể xem đơn hàng và kiểm tra lại trạng thái sau.
                  </p>
                </div>
              )}

              {/* Total Amount & Methods */}
              <div className="p-5 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-[#737373] uppercase tracking-wider block font-mono">
                    SỐ TIỀN THANH TOÁN
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#171717] font-mono tracking-tight mt-0.5 block">
                    {formatPrice(verifyResult.amount)}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-[#737373] font-medium block">Trạng thái đồng bộ</span>
                  <span className="text-xs font-bold text-[#15803D] mt-0.5 inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>VNPay ghi nhận thành công</span>
                  </span>
                </div>
              </div>

              {/* Technical Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {primaryOrderCode && (
                  <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white space-y-1">
                    <span className="text-[#737373] font-medium flex items-center gap-1.5 text-[11px]">
                      <Package className="w-3.5 h-3.5 text-neutral-400" />
                      Mã đơn hàng
                    </span>
                    <span className="font-mono font-bold text-[#171717] block text-sm">
                      {primaryOrderCode}
                    </span>
                  </div>
                )}

                {verifyResult.groupCode && (
                  <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white space-y-1">
                    <span className="text-[#737373] font-medium flex items-center gap-1.5 text-[11px]">
                      <Hash className="w-3.5 h-3.5 text-neutral-400" />
                      Mã nhóm đơn (Group Code)
                    </span>
                    <span className="font-mono font-bold text-[#171717] block text-sm">
                      {verifyResult.groupCode}
                    </span>
                  </div>
                )}

                {vnpTxnRef && (
                  <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white space-y-1">
                    <span className="text-[#737373] font-medium flex items-center gap-1.5 text-[11px]">
                      <Hash className="w-3.5 h-3.5 text-neutral-400" />
                      Mã tham chiếu (TxnRef)
                    </span>
                    <span className="font-mono font-semibold text-[#171717] block truncate">
                      {vnpTxnRef}
                    </span>
                  </div>
                )}

                {vnpTransactionNo && (
                  <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white space-y-1">
                    <span className="text-[#737373] font-medium flex items-center gap-1.5 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                      Mã giao dịch VNPay
                    </span>
                    <span className="font-mono font-semibold text-[#171717] block truncate">
                      {vnpTransactionNo}
                    </span>
                  </div>
                )}

                {vnpBankCode && (
                  <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white space-y-1">
                    <span className="text-[#737373] font-medium flex items-center gap-1.5 text-[11px]">
                      <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                      Ngân hàng thanh toán
                    </span>
                    <span className="font-bold text-[#171717] block">
                      {vnpBankCode}
                    </span>
                  </div>
                )}

                <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white space-y-1">
                  <span className="text-[#737373] font-medium flex items-center gap-1.5 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    Thời gian giao dịch
                  </span>
                  <span className="font-medium text-[#171717] block">
                    {formatPayDate(vnpPayDate)}
                  </span>
                </div>
              </div>

              {/* Actions: CẤM NÚT THANH TOÁN LẠI! Cung cấp nút Xem đơn hàng và nút Cập nhật trạng thái */}
              <div className="pt-4 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-end gap-3">
                <Link
                  to="/products"
                  className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-neutral-50 text-[#171717] border border-[#E5E5E5] text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Tiếp tục mua sắm</span>
                </Link>

                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={isManualRefreshing}
                  className="w-full sm:w-auto px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-[#171717] text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isManualRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isManualRefreshing ? 'Đang kiểm tra...' : 'Cập nhật trạng thái'}</span>
                </button>

                <Link
                  to="/account/orders"
                  className="w-full sm:w-auto px-6 py-3 bg-[#171717] hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Xem đơn hàng</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        ) : isExpired ? (
          /* ===================== TRẠNG THÁI D: GIAO DỊCH HẾT HẠN / ĐÃ HỦY ===================== */
          <motion.div
            key="state-expired"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="bg-white border border-[#E5E5E5] rounded-2xl shadow-xs overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 sm:p-10 border-b border-[#E5E5E5] bg-[#F5F5F5]/60 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 stroke-[2]" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 text-[11px] font-mono font-bold tracking-wider uppercase">
                  <span>GIAO DỊCH HẾT HẠN</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight font-display">
                  Giao dịch đã hết hạn
                </h1>
                <p className="text-xs sm:text-sm text-[#737373] max-w-lg mx-auto leading-relaxed">
                  Phiên thanh toán trực tuyến qua VNPay đã vượt quá thời gian cho phép (15 phút). Để bảo vệ quyền lợi tồn kho, đơn hàng đã được hệ thống tự động hoàn tồn kho và voucher.
                </p>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[#737373] block text-[11px]">Mã nhóm đơn hàng</span>
                  <span className="font-mono font-bold text-[#171717] text-sm">
                    {verifyResult.groupCode || vnpTxnRef}
                  </span>
                </div>
                <div>
                  <span className="text-[#737373] block text-[11px]">Số tiền giao dịch</span>
                  <span className="font-mono font-bold text-[#171717] text-sm">
                    {formatPrice(verifyResult.amount)}
                  </span>
                </div>
              </div>

              {/* Actions: NO RETRY BUTTON */}
              <div className="pt-4 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-end gap-3">
                <Link
                  to="/products"
                  className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-neutral-50 text-[#171717] border border-[#E5E5E5] text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Tiếp tục mua sắm</span>
                </Link>
                <Link
                  to="/account/orders"
                  className="w-full sm:w-auto px-6 py-3 bg-[#171717] hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Xem đơn hàng</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ===================== TRẠNG THÁI D: THANH TOÁN THẤT BẠI THẬT (MÃ LỖI NGÂN HÀNG KHÁC 00) ===================== */
          <motion.div
            key="state-failed"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="bg-white border border-[#E5E5E5] rounded-2xl shadow-xs overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 sm:p-10 border-b border-[#E5E5E5] bg-[#FEF2F2]/40 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] flex items-center justify-center mx-auto shadow-xs">
                <AlertCircle className="w-8 h-8 stroke-[2.2]" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[11px] font-mono font-bold tracking-wider uppercase">
                  <span>THANH TOÁN CHƯA HOÀN TẤT</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight font-display">
                  Thanh toán chưa thành công
                </h1>
                <p className="text-xs sm:text-sm text-[#737373] max-w-lg mx-auto leading-relaxed">
                  {verifyResult.message ||
                    'Giao dịch không thành công do bị từ chối từ phía ngân hàng hoặc phiên thanh toán bị hủy.'}
                </p>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white space-y-1">
                  <span className="text-[#737373] font-medium text-[11px] block">Mã tham chiếu (TxnRef)</span>
                  <span className="font-mono font-bold text-[#171717] block truncate">
                    {vnpTxnRef || verifyResult.groupCode}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white space-y-1">
                  <span className="text-[#737373] font-medium text-[11px] block">Số tiền thanh toán</span>
                  <span className="font-mono font-bold text-[#171717] text-base block">
                    {formatPrice(verifyResult.amount)}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-[#E5E5E5] bg-white space-y-1">
                  <span className="text-[#737373] font-medium text-[11px] block">Mã phản hồi từ cổng</span>
                  <span className="font-mono font-bold text-[#DC2626] block">
                    {verifyResult.responseCode || rawResponseCode || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-[#E5E5E5] text-xs text-[#737373] leading-relaxed">
                Đơn hàng của bạn vẫn đang ở trạng thái <strong>Chờ thanh toán</strong>. Tồn kho sản phẩm được giữ lại tạm thời. Bạn có thể tiến hành thanh toán lại bằng thẻ khác hoặc kiểm tra chi tiết trong danh sách đơn hàng.
              </div>

              {/* Actions: Thanh toán lại CHỈ XUẤT HIỆN khi backend xác nhận canRetry === true */}
              <div className="pt-4 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-end gap-3">
                <Link
                  to="/products"
                  className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-neutral-50 text-[#171717] border border-[#E5E5E5] text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Tiếp tục mua sắm</span>
                </Link>

                <Link
                  to="/account/orders"
                  className="w-full sm:w-auto px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-[#171717] text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2"
                >
                  <span>Xem đơn hàng</span>
                </Link>

                {verifyResult.canRetry && (
                  <button
                    type="button"
                    onClick={handleRetryPayment}
                    disabled={isRetrying}
                    className="w-full sm:w-auto px-6 py-3 bg-[#FF5C00] hover:bg-[#E05200] disabled:bg-neutral-300 text-white text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <RotateCcw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                    <span>{isRetrying ? 'Đang kết nối lại VNPay...' : 'Thanh toán lại VNPay'}</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
