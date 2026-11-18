import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, AlertCircle, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { ROLE_HOME_PATHS } from '../../lib/config';
import heroLogin from '../../assets/hero-login.jpg';

export const LoginPage: React.FC = () => {
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password modal states
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Redirect target from ProtectedRoute (if available)
  const fromLocation = (location.state as { from?: { pathname: string } })?.from?.pathname;

  // Auto redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const target = fromLocation || ROLE_HOME_PATHS[user.role] || '/';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate, fromLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Địa chỉ email không đúng định dạng.');
      return;
    }

    setIsLoading(true);

    try {
      const loggedInUser = await login({ email: trimmedEmail, password }, remember);
      const target = fromLocation || ROLE_HOME_PATHS[loggedInUser.role] || '/';
      navigate(target, { replace: true });
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotMessage(null);

    const trimmed = forgotEmail.trim();
    if (!trimmed) {
      setForgotError('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setForgotError('Địa chỉ email không đúng định dạng.');
      return;
    }

    setIsForgotLoading(true);
    try {
      const res = await authService.forgotPassword(trimmed);
      setForgotMessage(
        res?.message || 'Yêu cầu khôi phục mật khẩu đã được gửi. Vui lòng kiểm tra email của bạn.'
      );
    } catch (err: any) {
      setForgotError(err?.message || 'Không thể gửi yêu cầu khôi phục. Vui lòng thử lại.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Development quick fill utility (only in dev mode)
  const isDev = import.meta.env.DEV;
  const setTestAccount = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
    setRemember(true);
    setErrorMessage(null);
  };

  return (
    <main className="w-full min-h-screen flex flex-col lg:flex-row overflow-x-hidden bg-[#111113] text-zinc-300 selection:bg-[#FF5C00]/30 selection:text-white">
      {/* ================= LEFT HERO PANEL ================= */}
      <section
        className="relative hidden lg:flex lg:w-7/12 w-full min-h-screen flex-col justify-between overflow-hidden p-8 sm:p-12 lg:p-16 select-none bg-[#111113]"
        data-purpose="branding-visual-presentation"
      >
        {/* Background Image Layer with Atmospheric Gradients */}
        <div className="absolute inset-0 z-0">
          <img
            alt="TECHSTORE Monolith Hardware & Architecture Showcase"
            src={heroLogin}
            className="w-full h-full object-cover object-left lg:object-center filter brightness-[0.88] contrast-[1.08] opacity-75"
            loading="eager"
            decoding="sync"
          />
          {/* Vignette gradients for text readability and right edge fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-black/30 to-[#111113]/80 lg:bg-gradient-to-r lg:from-transparent lg:via-[#111113]/30 lg:to-[#111113]" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#111113] to-transparent hidden lg:block" />
        </div>

        {/* Top Branding Typography */}
        <div className="relative z-10 max-w-xl">
          {/* Orange Accent Bar */}
          <div className="w-9 h-[3px] bg-[#FF5C00] mb-4 shadow-[0_0_10px_rgba(255,92,0,0.6)]" />

          {/* Subtitle */}
          <p className="font-mono text-xs tracking-[0.28em] text-zinc-400 uppercase font-semibold mb-2">
            TECHSTORE
          </p>

          {/* Monolith Main Title */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-widest text-white leading-tight uppercase drop-shadow-md">
            MONOLITH
          </h1>

          {/* Slogan */}
          <p className="mt-8 font-sans text-xs sm:text-sm tracking-[0.16em] uppercase text-zinc-300 font-medium leading-relaxed max-w-sm">
            CÔNG NGHỆ KIẾN TẠO
            <br />
            NHỮNG ĐIỀU LỚN HƠN
          </p>

          {/* Technical Spec Points */}
          <div className="mt-8 space-y-1">
            <p className="font-mono text-[11px] tracking-[0.28em] text-zinc-400 uppercase leading-snug">
              THIẾT BỊ
              <br />
              KẾT NỐI
              <br />
              TƯƠNG LAI
            </p>
            <div className="w-8 h-[2px] bg-[#FF5C00] mt-3" />
          </div>
        </div>

        {/* Bottom Floating Metadata Details */}
        <div className="relative z-10 mt-auto pt-16 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          {/* Bottom Left Tagline */}
          <div className="space-y-1">
            <p className="font-mono text-[10px] tracking-[0.28em] text-zinc-500 uppercase leading-relaxed">
              TECHNOLOGY
              <br />
              FOR A BRIGHTER
              <br />
              TOMORROW
            </p>
          </div>

          {/* Bottom Right Tagline */}
          <div className="text-left sm:text-right space-y-1">
            <p className="font-mono text-[10px] tracking-[0.28em] text-zinc-400 uppercase leading-relaxed">
              PEOPLE
              <br />
              DEVICES
              <br />
              A BRIGHTER
              <br />
              TOMORROW
            </p>
            <div className="w-8 h-[2px] bg-[#FF5C00] sm:ml-auto mt-2" />
          </div>
        </div>
      </section>

      {/* ================= RIGHT AUTH SECTION ================= */}
      <section
        className="lg:w-5/12 w-full min-h-screen flex flex-col justify-center items-center px-6 py-12 sm:px-12 lg:px-14 xl:px-20 z-10 lg:border-l border-zinc-800/40 relative"
        data-purpose="user-authentication-form"
      >
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Header Branding */}
          <header className="mb-8" data-purpose="auth-header">
            {/* Orange Bar Accent */}
            <div className="w-10 h-1 bg-[#FF5C00] mb-4 shadow-[0_0_8px_rgba(255,92,0,0.6)]" />

            {/* Category Tags */}
            <div className="flex items-center space-x-2 text-xs font-mono font-bold tracking-[0.25em] uppercase mb-4 text-zinc-300">
              <span>TECHSTORE</span>
              <span className="text-zinc-600 font-normal">|</span>
              <span className="text-zinc-400">MONOLITH</span>
            </div>

            {/* Main Greeting Title */}
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2 font-display">
              Chào mừng trở lại.
            </h2>

            {/* Subtitle */}
            <p className="text-zinc-400 text-sm sm:text-base leading-normal">
              Đăng nhập để tiếp tục trải nghiệm TECHSTORE.
            </p>
          </header>

          {/* Error Alert Banner */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="mb-5 p-3.5 rounded-lg text-xs font-medium border bg-red-950/40 border-red-500/30 text-red-300 flex items-center gap-2.5 overflow-hidden"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5" data-purpose="login-form">
            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="login-email"
                className="block font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-zinc-400"
              >
                ĐỊA CHỈ EMAIL
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email của bạn"
                disabled={isLoading}
                required
                className="w-full bg-[#161619] border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 text-sm placeholder-zinc-500 transition-colors duration-150 outline-none focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00] disabled:opacity-50"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="login-password"
                className="block font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-zinc-400"
              >
                MẬT KHẨU
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu của bạn"
                  disabled={isLoading}
                  required
                  className="w-full bg-[#161619] border border-zinc-800 rounded-lg pl-4 pr-11 py-3 text-zinc-100 text-sm placeholder-zinc-500 transition-colors duration-150 outline-none focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00] disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 transition-colors p-1 cursor-pointer focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer text-zinc-400 hover:text-white transition-colors select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-800 bg-[#161619] accent-[#FF5C00] cursor-pointer"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotError(null);
                  setForgotMessage(null);
                  setIsForgotModalOpen(true);
                }}
                className="text-[#FF5C00] hover:underline font-medium transition-colors cursor-pointer bg-transparent border-none p-0 outline-none"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.15 }}
                className="w-full py-3.5 px-6 rounded-lg bg-[#FF5C00] hover:bg-[#E05200] active:bg-[#CC4900] text-white font-bold text-sm tracking-wider uppercase transition-all duration-150 shadow-[0_4px_16px_rgba(255,92,0,0.35)] flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang xác thực...</span>
                  </div>
                ) : (
                  <span>ĐĂNG NHẬP</span>
                )}
              </motion.button>
            </div>
          </form>

          {/* Footer Link */}
          <footer className="mt-8 text-center text-xs sm:text-sm text-zinc-400">
            <p>
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="text-[#FF5C00] font-semibold hover:underline transition-colors ml-1"
              >
                Đăng ký ngay.
              </Link>
            </p>
          </footer>

          {/* QA/Dev Quick Fill Utility */}
          {isDev && (
            <div className="mt-8 pt-4 border-t border-zinc-800/60 text-left">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block mb-2 font-mono">
                ⚡ Dev Quick Fill:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setTestAccount('admin@shop.local', 'Admin@123')}
                  className="text-[11px] px-2.5 py-1 rounded bg-[#161619] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setTestAccount('seller@shop.local', 'Seller@123')}
                  className="text-[11px] px-2.5 py-1 rounded bg-[#161619] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                >
                  Seller
                </button>
                <button
                  type="button"
                  onClick={() => setTestAccount('cskh@shop.local', 'Cskh@123')}
                  className="text-[11px] px-2.5 py-1 rounded bg-[#161619] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                >
                  CSKH
                </button>
                <button
                  type="button"
                  onClick={() => setTestAccount('customer@shop.local', 'Customer@123')}
                  className="text-[11px] px-2.5 py-1 rounded bg-[#161619] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                >
                  Customer
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* ================= FORGOT PASSWORD MODAL (STITCH SPEC) ================= */}
      <AnimatePresence>
        {isForgotModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-recovery-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsForgotModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Dialog Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 4 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="relative w-full max-w-lg bg-[#141417] border border-[#28282f] rounded-2xl shadow-2xl p-6 sm:p-8 text-zinc-300 z-10 text-left"
            >
              {/* Top Accent Bar */}
              <div className="w-10 h-1 bg-[#FF5C00] mb-5 rounded-full shadow-[0_0_8px_rgba(255,92,0,0.6)]" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                aria-label="Đóng modal"
                className="absolute top-6 right-6 text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800/60 transition-colors cursor-pointer outline-none"
              >
                ✕
              </button>

              {/* Modal Header with Shield Icon */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#FF5C00]/10 border border-[#FF5C00]/30 flex items-center justify-center text-[#FF5C00] shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-mono text-[10px] tracking-[0.25em] text-[#FF5C00] uppercase font-bold mb-1">
                    BẢO MẬT &amp; KHÔI PHỤC
                  </p>
                  <h3
                    id="modal-recovery-title"
                    className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug font-display"
                  >
                    Khôi phục mật khẩu
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-zinc-400 text-sm leading-relaxed mb-5 font-normal">
                Nhập địa chỉ email liên kết với tài khoản TECHSTORE của bạn. Hệ thống sẽ gửi hướng dẫn đặt lại mật khẩu an toàn.
              </p>

              {/* Feedback messages */}
              {forgotError && (
                <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{forgotError}</span>
                </div>
              )}
              {forgotMessage && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{forgotMessage}</span>
                </div>
              )}

              {/* Recovery Form */}
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="recovery-email"
                    className="block font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-zinc-400"
                  >
                    ĐỊA CHỈ EMAIL
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-zinc-500 pointer-events-none flex items-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="recovery-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      disabled={isForgotLoading}
                      required
                      className="w-full bg-[#18191d] border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-zinc-100 text-sm placeholder-zinc-500 transition-colors duration-150 outline-none focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00]"
                    />
                  </div>
                </div>

                {/* Info Notice */}
                <div className="p-3 bg-[#18191d] border border-zinc-800/80 rounded-lg flex items-center gap-2.5 text-xs text-zinc-400">
                  <span className="text-[#FF5C00] text-base font-bold leading-none">•</span>
                  <span>Liên kết khôi phục mã hóa có hiệu lực trong vòng 15 phút.</span>
                </div>

                {/* CTAs */}
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="w-full bg-[#FF5C00] hover:bg-[#E05200] active:scale-[0.99] text-white font-bold py-3 px-6 rounded-lg text-sm uppercase tracking-wider shadow-lg shadow-orange-950/40 transition-all duration-150 cursor-pointer disabled:opacity-50"
                  >
                    {isForgotLoading ? 'ĐANG GỬI YÊU CẦU...' : 'GỬI YÊU CẦU KHÔI PHỤC'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="w-full bg-transparent hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 font-medium py-2 px-4 rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Quay lại đăng nhập
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};
