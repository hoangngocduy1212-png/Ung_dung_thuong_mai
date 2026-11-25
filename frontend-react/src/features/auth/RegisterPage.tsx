import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck, LogIn, ArrowRight, UserPlus, Store, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import heroRegister from '../../assets/hero-register.jpg';

export const RegisterPage: React.FC = () => {
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Form states matching Stitch design and backend schema
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Multi-role selection: customer | seller-owner | seller-staff
  const [accountType, setAccountType] = useState<'customer' | 'seller-owner' | 'seller-staff'>('customer');
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [shopId, setShopId] = useState('');
  const [shops, setShops] = useState<Array<{ _id: string; name: string }>>([]);
  const [loadingShops, setLoadingShops] = useState(false);
  const [shopsError, setShopsError] = useState<string | null>(null);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Terms dialog modal
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Nạp danh sách gian hàng đang hoạt động khi chọn vai trò nhân viên (có AbortController cleanup)
  useEffect(() => {
    if (accountType !== 'seller-staff') {
      return;
    }

    const controller = new AbortController();
    let isCancelled = false;

    setLoadingShops(true);
    setShopsError(null);

    authService
      .getActiveShops(controller.signal)
      .then((data) => {
        if (isCancelled || controller.signal.aborted) return;
        setShops(data);
        if (data.length === 0) {
          setShopsError('Hiện chưa có gian hàng nào đang hoạt động để đăng ký nhân viên.');
        }
      })
      .catch((err: any) => {
        if (isCancelled || controller.signal.aborted || err?.name === 'AbortError') {
          // Yêu cầu bị hủy chủ động khi đổi tab hoặc unmount -> bỏ qua, không báo lỗi giả
          return;
        }
        setShops([]);
        setShopsError('Không thể tải danh sách gian hàng. Vui lòng thử lại sau.');
      })
      .finally(() => {
        if (!isCancelled && !controller.signal.aborted) {
          setLoadingShops(false);
        }
      });

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [accountType]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      errors.fullName = 'Họ và tên cần có ít nhất 2 ký tự.';
    }

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      errors.email = 'Địa chỉ email không hợp lệ.';
    }

    const trimmedPhone = phone.trim();
    const phoneRegex = /^(0|\+84)\d{9,10}$/;
    if (!trimmedPhone || !phoneRegex.test(trimmedPhone)) {
      errors.phone = 'Số điện thoại không đúng định dạng (VD: 0912345678).';
    }

    if (!password || password.length < 6) {
      errors.password = 'Mật khẩu cần tối thiểu 6 ký tự (khuyến nghị 8 ký tự).';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp.';
    }

    if (accountType === 'seller-owner' && (!shopName.trim() || shopName.trim().length < 2)) {
      errors.shopName = 'Tên gian hàng cần có ít nhất 2 ký tự.';
    }

    if (accountType === 'seller-staff' && !shopId) {
      errors.shopId = 'Vui lòng chọn gian hàng bạn muốn ứng tuyển/làm việc.';
    }

    if (!agreeTerms) {
      errors.terms = 'Bạn cần đồng ý với Điều khoản sử dụng và Chính sách bảo mật.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      setErrorMessage('Vui lòng kiểm tra lại các trường thông tin bên dưới.');
      return;
    }

    setIsLoading(true);

    try {
      const basePayload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      };

      const res =
        accountType === 'customer'
          ? await authService.registerCustomer(basePayload)
          : await authService.registerSeller(
              accountType === 'seller-owner'
                ? {
                    ...basePayload,
                    sellerType: 'owner',
                    shopName: shopName.trim(),
                    shopDescription: shopDescription.trim() || undefined,
                  }
                : {
                    ...basePayload,
                    sellerType: 'staff',
                    shopId,
                  }
            );

      if (res.token) {
        setSuccessMessage(
          accountType === 'customer'
            ? 'Đăng ký tài khoản thành công! Đang chuyển hướng...'
            : 'Đăng ký gian hàng thành công! Gian hàng đang chờ Quản trị viên phê duyệt.'
        );
        await refreshProfile();
        setTimeout(() => {
          navigate(accountType === 'customer' ? '/' : '/seller', { replace: true });
        }, 1200);
      } else {
        setSuccessMessage(
          accountType === 'seller-staff'
            ? 'Đăng ký thành công! Vui lòng chờ chủ gian hàng phê duyệt tài khoản trước khi đăng nhập.'
            : 'Đăng ký thành công! Vui lòng đăng nhập.'
        );
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Đăng ký không thành công. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen flex flex-col lg:flex-row overflow-x-hidden bg-[#0D0F12] text-zinc-300 font-sans antialiased selection:bg-[#FF5C00]/30 selection:text-white">
      {/* ================= LEFT BRAND SHOWCASE PANEL ================= */}
      <section
        className="relative hidden lg:flex lg:w-7/12 flex-col justify-between p-12 xl:p-16 overflow-hidden select-none bg-[#0D0F12]"
        data-purpose="hero-brand-panel"
      >
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0 bg-[#0D0F12]">
          <img
            alt="TECHSTORE Monolith Architecture & Tech Showcase"
            src={heroRegister}
            className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-125"
            loading="eager"
            decoding="sync"
          />
          {/* Subtle gradient overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F12] via-black/40 to-[#0D0F12]/80" />
          <div className="absolute inset-y-0 right-0 w-36 bg-gradient-to-l from-[#0D0F12] via-[#0D0F12]/80 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0D0F12]/60 to-transparent" />
        </div>

        {/* Top Typography & Statement Headline */}
        <div className="relative z-10 max-w-xl">
          {/* Orange Accent Bar */}
          <div className="w-10 h-1 bg-[#FF5C00] mb-5 shadow-[0_0_12px_rgba(255,92,0,0.7)]" />

          {/* Brand Category Tags */}
          <div className="flex items-center space-x-2 text-[13px] font-bold tracking-[0.28em] uppercase text-zinc-300 mb-6 font-mono">
            <span>TECHSTORE</span>
            <span className="text-zinc-600 font-normal">|</span>
            <span className="text-zinc-400">MONOLITH</span>
          </div>

          {/* Main Statement Headline */}
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.18] uppercase font-display">
            CÔNG NGHỆ
            <br />
            MỞ RA
            <br />
            NHIỀU HƠN.
          </h1>

          {/* Sub-statement */}
          <p className="text-sm xl:text-base tracking-[0.2em] font-semibold text-zinc-300 uppercase mt-5 mb-5 font-mono">
            CHO MỘT NGÀY TỐT ĐẸP HƠN.
          </p>

          {/* Description Paragraph */}
          <p className="text-xs xl:text-sm text-zinc-400 font-normal leading-relaxed max-w-md">
            Cùng TECHSTORE khám phá những công nghệ tiên tiến, kiến tạo trải nghiệm vượt trội cho cuộc sống hiện đại.
          </p>
        </div>

        {/* Bottom Technical Meta Tag */}
        <div className="relative z-10 mt-12">
          <div className="w-10 h-0.5 bg-[#FF5C00] mb-3 opacity-90 shadow-[0_0_8px_rgba(255,92,0,0.5)]" />
          <p className="text-[11px] tracking-[0.25em] font-medium uppercase text-zinc-400 leading-relaxed font-mono">
            TECHNOLOGY
            <br />
            EMPOWERS
            <br />
            A BRIGHTER
            <br />
            TOMORROW
          </p>
        </div>
      </section>

      {/* ================= RIGHT REGISTRATION FORM SECTION ================= */}
      <section
        className="lg:w-5/12 w-full flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 lg:px-12 xl:px-16 py-12 bg-[#0D0F12] z-10 lg:border-l border-zinc-800/50"
        data-purpose="registration-form-panel"
      >
        <motion.div
          className="w-full max-w-md mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Header Brand Indicator */}
          <header className="mb-6">
            <div className="w-9 h-1 bg-[#FF5C00] mb-3.5 shadow-[0_0_8px_rgba(255,92,0,0.6)]" />
            <div className="flex items-center space-x-2">
              <span className="block text-xs font-bold tracking-[0.25em] text-zinc-200 uppercase font-mono">
                TECHSTORE
              </span>
              <span className="text-zinc-600 font-normal">|</span>
              <span className="block text-xs font-medium tracking-[0.2em] text-zinc-400 uppercase font-mono">
                ĐĂNG KÝ
              </span>
            </div>
            <h2 className="text-3xl sm:text-[34px] font-bold text-white mt-3 mb-1.5 tracking-tight font-display">
              Tạo tài khoản.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-normal">
              Tham gia TECHSTORE và bắt đầu hành trình công nghệ của bạn.
            </p>
          </header>

          {/* Feedback Banners */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                className="mb-4 p-3 rounded-lg text-xs font-medium border bg-red-950/40 border-red-500/30 text-red-300 flex items-center gap-2.5 overflow-hidden"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                className="mb-4 p-3 rounded-lg text-xs font-medium border bg-emerald-950/40 border-emerald-500/30 text-emerald-300 flex items-center gap-2.5 overflow-hidden"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5" id="techstore-register-form">
            {/* Field 1: Full Name */}
            <div className="space-y-1 text-left">
              <label
                htmlFor="fullName"
                className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-300 font-mono"
              >
                HỌ VÀ TÊN
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: '' }));
                }}
                placeholder="Nhập họ và tên"
                disabled={isLoading}
                required
                className={`w-full px-4 py-2.5 bg-[#1A1D23] border ${
                  fieldErrors.fullName ? 'border-red-500' : 'border-[#2A2E37]'
                } rounded-md text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00] transition-colors`}
              />
              {fieldErrors.fullName && (
                <p className="text-[11px] text-red-400 mt-0.5">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Field 2: Email Address */}
            <div className="space-y-1 text-left">
              <label
                htmlFor="email"
                className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-300 font-mono"
              >
                ĐỊA CHỈ EMAIL
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="Nhập địa chỉ email"
                disabled={isLoading}
                required
                className={`w-full px-4 py-2.5 bg-[#1A1D23] border ${
                  fieldErrors.email ? 'border-red-500' : 'border-[#2A2E37]'
                } rounded-md text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00] transition-colors`}
              />
              {fieldErrors.email && (
                <p className="text-[11px] text-red-400 mt-0.5">{fieldErrors.email}</p>
              )}
            </div>

            {/* Field 3: Phone Number */}
            <div className="space-y-1 text-left">
              <label
                htmlFor="phone"
                className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-300 font-mono"
              >
                SỐ ĐIỆN THOẠI
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: '' }));
                }}
                placeholder="Nhập số điện thoại"
                disabled={isLoading}
                required
                className={`w-full px-4 py-2.5 bg-[#1A1D23] border ${
                  fieldErrors.phone ? 'border-red-500' : 'border-[#2A2E37]'
                } rounded-md text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00] transition-colors`}
              />
              {fieldErrors.phone && (
                <p className="text-[11px] text-red-400 mt-0.5">{fieldErrors.phone}</p>
              )}
            </div>

            {/* Field 4: Password */}
            <div className="space-y-1 text-left">
              <label
                htmlFor="password"
                className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-300 font-mono"
              >
                MẬT KHẨU
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder="Tạo mật khẩu"
                  disabled={isLoading}
                  required
                  className={`w-full pl-4 pr-11 py-2.5 bg-[#1A1D23] border ${
                    fieldErrors.password ? 'border-red-500' : 'border-[#2A2E37]'
                  } rounded-md text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00] transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 focus:outline-none p-1 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 font-normal pt-0.5">
                Mật khẩu nên có ít nhất 8 ký tự.
              </p>
              {fieldErrors.password && (
                <p className="text-[11px] text-red-400 mt-0.5">{fieldErrors.password}</p>
              )}
            </div>

            {/* Field 5: Confirm Password */}
            <div className="space-y-1 text-left">
              <label
                htmlFor="confirmPassword"
                className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-300 font-mono"
              >
                XÁC NHẬN MẬT KHẨU
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword)
                      setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  placeholder="Nhập lại mật khẩu"
                  disabled={isLoading}
                  required
                  className={`w-full pl-4 pr-11 py-2.5 bg-[#1A1D23] border ${
                    fieldErrors.confirmPassword ? 'border-red-500' : 'border-[#2A2E37]'
                  } rounded-md text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00] transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 focus:outline-none p-1 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-[11px] text-red-400 mt-0.5">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Field 6: Account Type Selection */}
            <div className="space-y-1.5 text-left pt-1">
              <label
                htmlFor="accountType"
                className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-300 font-mono"
              >
                LOẠI TÀI KHOẢN
              </label>
              <div
                className="grid grid-cols-3 gap-2"
                role="tablist"
                aria-label="Loại tài khoản đăng ký"
                id="accountType"
              >
                {[
                  { value: 'customer' as const, label: 'Khách hàng', icon: UserPlus },
                  { value: 'seller-owner' as const, label: 'Chủ gian hàng', icon: Store },
                  { value: 'seller-staff' as const, label: 'Nhân viên shop', icon: Users },
                ].map(({ value, label, icon: Icon }) => {
                  const isActive = accountType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        setAccountType(value);
                        setFieldErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.shopName;
                          delete copy.shopId;
                          return copy;
                        });
                      }}
                      className={`h-11 px-2 rounded-md text-xs font-semibold leading-tight border transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer ${
                        isActive
                          ? 'bg-[#FF5C00] border-[#FF5C00] text-white shadow-[0_2px_12px_rgba(255,92,0,0.35)]'
                          : 'bg-[#161619] border-[#2A2E37] text-zinc-400 hover:text-white hover:border-zinc-600'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field 7: Shop Selection (for seller-staff only) */}
            {accountType === 'seller-staff' && (
              <div className="space-y-1 text-left pt-1">
                <label
                  htmlFor="shopId"
                  className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-300 font-mono"
                >
                  CHỌN GIAN HÀNG <span className="text-red-400">*</span>
                </label>
                {loadingShops ? (
                  <div className="w-full px-4 py-2.5 bg-[#1A1D23] border border-[#2A2E37] rounded-md text-sm text-zinc-400 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-[#FF5C00] rounded-full animate-spin" />
                    <span>Đang tải danh sách gian hàng...</span>
                  </div>
                ) : (
                  <select
                    id="shopId"
                    name="shopId"
                    value={shopId}
                    onChange={(e) => {
                      setShopId(e.target.value);
                      if (fieldErrors.shopId) setFieldErrors((prev) => ({ ...prev, shopId: '' }));
                    }}
                    disabled={isLoading}
                    className={`w-full px-4 py-2.5 bg-[#1A1D23] border ${
                      fieldErrors.shopId ? 'border-red-500' : 'border-[#2A2E37]'
                    } rounded-md text-sm text-white focus:outline-none focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00] transition-colors`}
                  >
                    <option value="">-- Chọn gian hàng đang hoạt động --</option>
                    {shops.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
                {shopsError && (
                  <p className="text-[11px] text-amber-400 mt-0.5">{shopsError}</p>
                )}
                {fieldErrors.shopId && (
                  <p className="text-[11px] text-red-400 mt-0.5">{fieldErrors.shopId}</p>
                )}
                <p className="text-[11px] text-zinc-500 font-normal pt-0.5">
                  Tài khoản nhân viên sau khi đăng ký sẽ ở trạng thái chờ Chủ gian hàng duyệt.
                </p>
              </div>
            )}

            {/* Field 8: Shop Name (for seller-owner only) */}
            {accountType === 'seller-owner' && (
              <div className="space-y-1 text-left pt-1">
                <label
                  htmlFor="shopName"
                  className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-300 font-mono"
                >
                  TÊN GIAN HÀNG <span className="text-red-400">*</span>
                </label>
                <input
                  id="shopName"
                  name="shopName"
                  type="text"
                  value={shopName}
                  onChange={(e) => {
                    setShopName(e.target.value);
                    if (fieldErrors.shopName) setFieldErrors((prev) => ({ ...prev, shopName: '' }));
                  }}
                  placeholder="Nhập tên gian hàng của bạn"
                  disabled={isLoading}
                  required
                  className={`w-full px-4 py-2.5 bg-[#1A1D23] border ${
                    fieldErrors.shopName ? 'border-red-500' : 'border-[#2A2E37]'
                  } rounded-md text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00] transition-colors`}
                />
                {fieldErrors.shopName && (
                  <p className="text-[11px] text-red-400 mt-0.5">{fieldErrors.shopName}</p>
                )}
              </div>
            )}

            {/* Field 9: Shop Description (for seller-owner only) */}
            {accountType === 'seller-owner' && (
              <div className="space-y-1 text-left pt-1">
                <label
                  htmlFor="shopDescription"
                  className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-300 font-mono"
                >
                  MÔ TẢ GIAN HÀNG (TÙY CHỌN)
                </label>
                <textarea
                  id="shopDescription"
                  name="shopDescription"
                  value={shopDescription}
                  onChange={(e) => setShopDescription(e.target.value)}
                  placeholder="Giới thiệu ngắn về gian hàng và ngành hàng kinh doanh..."
                  disabled={isLoading}
                  rows={2}
                  className="w-full px-4 py-2 bg-[#1A1D23] border border-[#2A2E37] rounded-md text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00] transition-colors resize-none"
                />
                <p className="text-[11px] text-zinc-500 font-normal pt-0.5">
                  Gian hàng mới tạo sẽ ở trạng thái chờ Quản trị viên hệ thống phê duyệt.
                </p>
              </div>
            )}

            {/* Field 10: Terms & Condition Checkbox */}
            <div className="flex items-start pt-1.5 text-left" data-purpose="terms-checkbox">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (fieldErrors.terms) setFieldErrors((prev) => ({ ...prev, terms: '' }));
                  }}
                  required
                  className="w-4 h-4 rounded border-[#2A2E37] bg-[#1A1D23] text-[#FF5C00] accent-[#FF5C00] focus:ring-[#FF5C00] focus:ring-offset-[#0D0F12] focus:ring-1 cursor-pointer"
                />
              </div>
              <div className="ml-2.5 text-xs text-zinc-400 leading-snug">
                <label htmlFor="terms" className="cursor-pointer select-none">
                  Tôi đồng ý với{' '}
                  <button
                    type="button"
                    onClick={() => setIsTermsModalOpen(true)}
                    className="text-[#FF5C00] hover:underline font-medium cursor-pointer inline bg-transparent border-none p-0"
                  >
                    Điều khoản sử dụng
                  </button>{' '}
                  và{' '}
                  <button
                    type="button"
                    onClick={() => setIsTermsModalOpen(true)}
                    className="text-[#FF5C00] hover:underline font-medium cursor-pointer inline bg-transparent border-none p-0"
                  >
                    Chính sách bảo mật
                  </button>
                  .
                </label>
              </div>
            </div>
            {fieldErrors.terms && (
              <p className="text-[11px] text-red-400 text-left -mt-1">{fieldErrors.terms}</p>
            )}

            {/* Primary Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="monolith-primary-btn w-full py-3.5 px-6 text-sm tracking-wider uppercase select-none"
                data-purpose="submit-register-button"
              >
                {isLoading ? (
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang đăng ký...</span>
                  </div>
                ) : (
                  <span className="relative z-10 flex items-center justify-center gap-2 font-bold tracking-wider">
                    {accountType === 'seller-owner' ? (
                      <Store className="w-4 h-4" />
                    ) : accountType === 'seller-staff' ? (
                      <Users className="w-4 h-4" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    <span>
                      {accountType === 'seller-owner'
                        ? 'ĐĂNG KÝ MỞ GIAN HÀNG'
                        : accountType === 'seller-staff'
                        ? 'ĐĂNG KÝ NHÂN VIÊN GIAN HÀNG'
                        : 'ĐĂNG KÝ TÀI KHOẢN'}
                    </span>
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* ================= SECONDARY CTA: LOGIN ================= */}
          <footer className="mt-6 pt-1" data-purpose="login-cta-section">
            {/* Technical Monolith Divider */}
            <div className="relative mb-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800/80" />
              </div>
              <div className="relative px-3.5 bg-[#111113] text-[10px] font-mono tracking-[0.22em] text-zinc-500 uppercase font-semibold select-none">
                ĐÃ CÓ TÀI KHOẢN TECHSTORE?
              </div>
            </div>

            {/* Specular Cyber Login Button */}
            <Link
              to="/login"
              className="monolith-specular-btn group w-full py-3.5 px-6 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold tracking-wider uppercase select-none no-underline"
              data-purpose="login-redirect-button"
            >
              <LogIn className="w-4 h-4 text-zinc-400 group-hover:text-[#FF5C00] transition-colors duration-200 relative z-10" />
              <span className="relative z-10 font-bold">ĐĂNG NHẬP NGAY</span>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-200 relative z-10" />
            </Link>
          </footer>
        </motion.div>
      </section>

      {/* Terms & Privacy Info Modal */}
      <AnimatePresence>
        {isTermsModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTermsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-[#141417] border border-[#28282f] rounded-2xl shadow-2xl p-6 sm:p-8 text-zinc-300 z-10 text-left max-h-[85vh] overflow-y-auto"
            >
              <div className="w-10 h-1 bg-[#FF5C00] mb-5 rounded-full" />
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-white p-2"
              >
                ✕
              </button>
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-6 h-6 text-[#FF5C00]" />
                <h3 className="text-xl font-bold text-white font-display">
                  Điều khoản sử dụng &amp; Bảo mật
                </h3>
              </div>
              <div className="space-y-3 text-xs text-zinc-400 leading-relaxed">
                <p>
                  1. <strong>Bảo mật thông tin:</strong> TECHSTORE cam kết bảo vệ toàn vẹn dữ liệu cá nhân của người dùng, tuân thủ các tiêu chuẩn mã hóa SHA-256 và bảo mật theo quy định pháp luật.
                </p>
                <p>
                  2. <strong>Quyền và trách nhiệm:</strong> Khách hàng có trách nhiệm bảo mật mật khẩu tài khoản và thông báo kịp thời cho đội ngũ hỗ trợ khi phát hiện truy cập bất thường.
                </p>
                <p>
                  3. <strong>Sử dụng dịch vụ:</strong> Mọi hành vi gian lận đơn hàng, spam đánh giá hoặc can thiệp kỹ thuật trái phép sẽ bị khóa tài khoản vĩnh viễn.
                </p>
              </div>
              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => setIsTermsModalOpen(false)}
                  className="w-full bg-[#FF5C00] text-white font-semibold py-2.5 rounded-lg text-xs uppercase tracking-wider"
                >
                  ĐÃ HIỂU VÀ ĐÓNG
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};
