import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { catalogService } from '../../services/catalogService';
import { customerService } from '../../services/customerService';
import { useAuth } from '../../hooks/useAuth';
import { createStaggerContainer, staggerItemVariants } from '../../lib/motion';
import type { PlatformVoucher } from '../../types/catalog';
import type { UserVoucher } from '../../types/customer';
import { Loading } from '../../components/common/Loading';
import {
  Tag,
  Gift,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Laptop,
  Smartphone,
  Headphones,
  Cpu,
} from 'lucide-react';

export const PromotionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [vouchers, setVouchers] = useState<PlatformVoucher[]>([]);
  const [myVouchers, setMyVouchers] = useState<UserVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const platformVouchers = await catalogService.getPlatformVouchers();
      setVouchers(platformVouchers || []);

      if (isAuthenticated) {
        const userVouchers = await customerService.getMyVouchers();
        setMyVouchers(userVouchers || []);
      }
    } catch (err: any) {
      console.error('Fetch promotions error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [isAuthenticated]);

  const claimedVoucherIds = new Set(
    myVouchers.filter((uv) => uv.status === 'unused').map((uv) => uv.voucher?._id)
  );

  const handleClaim = async (v: PlatformVoucher) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/promotions' } } });
      return;
    }

    try {
      setActionLoadingId(v._id);
      setFeedback(null);
      await customerService.claimVoucher(v._id);
      setFeedback({
        type: 'success',
        message: `Đã lưu mã "${v.code}" vào ví voucher của bạn!`,
      });
      fetchPromotions();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Không thể nhận voucher. Vui lòng thử lại sau.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRedeem = async (v: PlatformVoucher) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/promotions' } } });
      return;
    }

    if ((user?.points || 0) < v.pointsCost) {
      setFeedback({
        type: 'error',
        message: `Bạn cần ${v.pointsCost.toLocaleString('vi-VN')} điểm để đổi mã này (Hiện có: ${(user?.points || 0).toLocaleString('vi-VN')} điểm).`,
      });
      return;
    }

    const ok = window.confirm(
      `Bạn có muốn dùng ${v.pointsCost.toLocaleString('vi-VN')} điểm để đổi mã giảm giá "${v.code}" không?`
    );
    if (!ok) return;

    try {
      setActionLoadingId(v._id);
      setFeedback(null);
      await customerService.redeemVoucher(v._id);
      setFeedback({
        type: 'success',
        message: `Đổi thành công mã "${v.code}"! Bạn có thể sử dụng khi thanh toán đơn hàng.`,
      });
      fetchPromotions();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Không thể đổi điểm lấy voucher.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatPrice = (val: number) => {
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-[1366px] mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-10" data-purpose="promotions-page">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
          Chương trình Khuyến mãi
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Tổng hợp mã ưu đãi toàn sàn và các đặc quyền công nghệ dành riêng cho bạn
        </p>
      </div>

      {/* Hero Banner (Stitch Spec) */}
      <section className="w-full bg-[#141417] text-white rounded-2xl overflow-hidden shadow-sm border border-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-12 items-center">
          <div className="md:col-span-7 p-6 sm:p-10 lg:p-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5C00]/10 border border-[#FF5C00]/30 text-[#FF5C00] font-mono text-xs font-semibold uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TECHSTORE PRIVILEGE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              Ưu đãi công nghệ dành cho bạn
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-xl font-normal">
              Khám phá các voucher trợ giá độc quyền từ TECHSTORE. Áp dụng giảm trực tiếp trên tổng giá trị đơn hàng cho mọi thiết bị công nghệ chính hãng.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/products"
                className="px-5 py-2.5 bg-[#FF5C00] hover:bg-[#E55200] text-white text-xs font-bold rounded-lg transition inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>Khám phá sản phẩm</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              {isAuthenticated && (
                <div className="text-xs text-neutral-400 font-mono">
                  Điểm tích lũy hiện có: <span className="font-bold text-[#FF5C00]">{(user?.points || 0).toLocaleString('vi-VN')} pts</span>
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-5 h-48 md:h-72 bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center p-6 border-t md:border-t-0 md:border-l border-neutral-800">
            <div className="text-center space-y-2">
              <Gift className="w-16 h-16 text-[#FF5C00] mx-auto opacity-90 stroke-[1.5]" />
              <div className="font-mono text-xs text-neutral-400 uppercase tracking-widest font-semibold">
                MONOLITH VOUCHER ENGINE
              </div>
              <div className="text-xl font-bold text-white">Giảm giá tiền mặt cố định</div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Alert Notification */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Platform Vouchers Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#FF5C00]" />
            <h2 className="text-lg font-bold text-neutral-900">Mã giảm giá toàn sàn đang phát hành</h2>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            {vouchers.length} voucher khả dụng
          </span>
        </div>

        {loading ? (
          <div className="py-12">
            <Loading message="Đang tải danh sách voucher khuyến mại..." />
          </div>
        ) : vouchers.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center text-xs text-neutral-500">
            Hiện tại chưa có mã giảm giá toàn sàn mới. Vui lòng quay lại sau!
          </div>
        ) : (
          <motion.div
            variants={createStaggerContainer(0.04)}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {vouchers.map((v) => {
              const isClaimed = claimedVoucherIds.has(v._id);
              const isPointsVoucher = v.pointsCost > 0;
              const isOperating = actionLoadingId === v._id;

              return (
                <motion.div
                  key={v._id}
                  variants={staggerItemVariants}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs hover:border-neutral-300 transition-shadow flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  {/* Scope badge */}
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[10px] font-mono font-bold rounded uppercase">
                      Toàn sàn
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      Còn lại: <strong className="text-neutral-900">{v.remaining}</strong> lượt
                    </span>
                  </div>

                  {/* Discount details */}
                  <div className="space-y-1">
                    <div className="text-2xl font-black text-[#FF5C00] font-mono tracking-tight">
                      -{formatPrice(v.amount)}
                    </div>
                    <h3 className="font-bold text-sm text-neutral-900 leading-snug">{v.title}</h3>
                    <p className="text-xs text-neutral-500">
                      Đơn tối thiểu: <span className="font-mono font-semibold text-neutral-800">{formatPrice(v.minOrder)}</span>
                    </p>
                  </div>

                  {/* Code and Expiration */}
                  <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-mono bg-neutral-50 p-2 rounded border border-neutral-200">
                      <span className="font-bold text-neutral-900 tracking-wider">{v.code}</span>
                      <span className="text-[10px] text-neutral-400">MÃ ƯU ĐÃI</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      <span>Hạn dùng: {formatDate(v.endDate)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    {isClaimed ? (
                      <div className="w-full py-2 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-lg text-center border border-emerald-200 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã có trong ví của bạn</span>
                      </div>
                    ) : isPointsVoucher ? (
                      <button
                        type="button"
                        onClick={() => handleRedeem(v)}
                        disabled={isOperating}
                        className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] disabled:bg-neutral-300 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#FF5C00]" />
                        <span>{isOperating ? 'Đang đổi...' : `Đổi bằng ${v.pointsCost.toLocaleString('vi-VN')} điểm`}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleClaim(v)}
                        disabled={isOperating}
                        className="w-full py-2 bg-[#FF5C00] hover:bg-[#E55200] active:scale-[0.98] disabled:bg-neutral-300 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>{isOperating ? 'Đang lưu...' : 'Lưu vào ví voucher'}</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* Category Promotion Campaigns (Stitch Spec) */}
      <section className="space-y-4 pt-6 border-t border-neutral-200">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Danh mục ưu đãi nổi bật</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Khám phá các thiết bị công nghệ với giá tốt nhất hôm nay</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/products"
            className="group p-5 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 hover:shadow-xs transition flex flex-col justify-between space-y-4"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#FF5C00] flex items-center justify-center group-hover:scale-105 transition">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-900 group-hover:text-[#FF5C00] transition">Laptop &amp; Máy tính xách tay</h3>
              <p className="text-xs text-neutral-500 mt-1">Các dòng Ultrabook, Gaming thế hệ mới</p>
            </div>
            <span className="text-xs font-semibold text-[#FF5C00] inline-flex items-center gap-1">
              Xem sản phẩm <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/products"
            className="group p-5 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 hover:shadow-xs transition flex flex-col justify-between space-y-4"
          >
            <div className="w-10 h-10 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center group-hover:scale-105 transition">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-900 group-hover:text-[#FF5C00] transition">Điện thoại di động</h3>
              <p className="text-xs text-neutral-500 mt-1">Flagship cao cấp và tầm trung chính hãng</p>
            </div>
            <span className="text-xs font-semibold text-[#FF5C00] inline-flex items-center gap-1">
              Xem sản phẩm <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/products"
            className="group p-5 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 hover:shadow-xs transition flex flex-col justify-between space-y-4"
          >
            <div className="w-10 h-10 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center group-hover:scale-105 transition">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-900 group-hover:text-[#FF5C00] transition">Thiết bị Âm thanh</h3>
              <p className="text-xs text-neutral-500 mt-1">Tai nghe chống ồn, loa không dây chất lượng cao</p>
            </div>
            <span className="text-xs font-semibold text-[#FF5C00] inline-flex items-center gap-1">
              Xem sản phẩm <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/products"
            className="group p-5 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 hover:shadow-xs transition flex flex-col justify-between space-y-4"
          >
            <div className="w-10 h-10 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center group-hover:scale-105 transition">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-900 group-hover:text-[#FF5C00] transition">Phụ kiện &amp; Linh kiện</h3>
              <p className="text-xs text-neutral-500 mt-1">Cáp sạc nhanh, củ sạc GaN, bàn phím cơ</p>
            </div>
            <span className="text-xs font-semibold text-[#FF5C00] inline-flex items-center gap-1">
              Xem sản phẩm <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
};
