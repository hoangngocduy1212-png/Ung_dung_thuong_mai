import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PageTransition, CartBadgePulse, dropdownVariants, fadeSlideDownVariants } from '../../lib/motion';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../providers/CartProvider';
import { catalogService } from '../../services/catalogService';
import type { Category } from '../../types/catalog';
import {
  Search,
  ShoppingCart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  LayoutGrid,
  Store,
  Shield,
  Headphones,
  LogOut,
  Package,
  Heart,
  Tag,
} from 'lucide-react';

export const RootLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    catalogService
      .getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    setIsAccountOpen(false);
    await logout();
    navigate('/');
  };

  const topCategories = categories.filter((c) => !c.parent).slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans selection:bg-[#FF5C00] selection:text-white">
      {/* Top Announcement Bar */}
      <div className="bg-[#111111] text-neutral-300 text-[12px] py-1.5 px-4 border-b border-neutral-800">
        <div className="max-w-[1320px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-wider uppercase bg-[#FF5C00] text-white px-1.5 py-0.5 rounded font-semibold">
              TECHSTORE MONOLITH
            </span>
            <span className="hidden sm:inline text-neutral-400">
              Hệ thống công nghệ & thiết bị điện tử chính hãng hàng đầu
            </span>
          </div>
          <div className="flex items-center gap-5 text-neutral-300">
            <Link to="/policies/returns" className="hover:text-white transition-colors">
              Đổi trả 7 ngày
            </Link>
            <Link to="/help" className="hover:text-white transition-colors">
              Hỗ trợ khách hàng
            </Link>
            <span className="hidden md:inline font-mono font-medium text-neutral-400">
              Hotline: 1800-8888
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-xs">
        <div className="max-w-[1320px] mx-auto px-4 lg:px-6">
          {/* Main Topbar Row */}
          <div className="flex items-center justify-between py-3.5 gap-4 md:gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
              <span className="font-black text-[22px] tracking-tight text-neutral-950 font-sans">
                TECHSTORE
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]" />
            </Link>

            {/* Central Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 max-w-[580px] mx-2 hidden sm:block"
            >
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm laptop, điện thoại, phụ kiện công nghệ..."
                  className="w-full pl-10 pr-4 py-2 bg-[#F1F3F5] hover:bg-[#EAECEF] focus:bg-white text-[13.5px] rounded-full border border-transparent focus:border-neutral-300 focus:ring-1 focus:ring-[#FF5C00] transition-all placeholder:text-neutral-400 text-neutral-800 outline-none"
                />
              </div>
            </form>

            {/* Right Action Icons: Account & Cart */}
            <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0 text-[14px]">
              {/* Account Dropdown */}
              <div className="relative" ref={accountMenuRef}>
                {isAuthenticated && user ? (
                  <button
                    onClick={() => setIsAccountOpen(!isAccountOpen)}
                    className="flex items-center gap-2 font-medium text-neutral-800 hover:text-[#FF5C00] transition-colors py-1 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-neutral-100 border border-neutral-300 flex items-center justify-center text-xs font-semibold text-neutral-800">
                      {(user.fullName || user.name || 'U')[0].toUpperCase()}
                    </div>
                    <span className="hidden md:inline max-w-[110px] truncate text-xs font-semibold">
                      {user.fullName || user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 font-medium text-neutral-800 hover:text-[#FF5C00] transition-colors py-1"
                  >
                    <UserIcon className="w-5 h-5 text-neutral-700" />
                    <span className="hidden sm:inline font-semibold text-[13.5px]">Tài khoản</span>
                  </Link>
                )}

                {/* Account Menu Dropdown Box with Precision Spring Origin */}
                <AnimatePresence>
                  {isAccountOpen && isAuthenticated && user && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl py-2 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-2.5 border-b border-neutral-100">
                        <p className="text-xs font-medium text-neutral-500">Đăng nhập với tư cách</p>
                        <p className="text-sm font-semibold text-neutral-900 truncate">
                          {user.fullName || user.name}
                        </p>
                        <span className="inline-block mt-1 font-mono text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700">
                          {user.role}
                        </span>
                      </div>

                      <div className="py-1 text-xs">
                        {user.role === 'customer' && (
                          <>
                            <Link
                              to="/account"
                              onClick={() => setIsAccountOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 hover:bg-neutral-50 hover:text-[#FF5C00] transition-colors"
                            >
                              <UserIcon className="w-4 h-4" />
                              Tổng quan tài khoản
                            </Link>
                            <Link
                              to="/account/orders"
                              onClick={() => setIsAccountOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 hover:bg-neutral-50 hover:text-[#FF5C00] transition-colors"
                            >
                              <Package className="w-4 h-4" />
                              Lịch sử đơn hàng
                            </Link>
                            <Link
                              to="/account/wishlist"
                              onClick={() => setIsAccountOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 hover:bg-neutral-50 hover:text-[#FF5C00] transition-colors"
                            >
                              <Heart className="w-4 h-4" />
                              Sản phẩm yêu thích
                            </Link>
                          </>
                        )}

                        {user.role === 'seller' && (
                          <Link
                            to="/seller"
                            onClick={() => setIsAccountOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 hover:bg-neutral-50 hover:text-[#FF5C00] transition-colors"
                          >
                            <Store className="w-4 h-4 text-emerald-600" />
                            Kênh Người Bán (Seller Studio)
                          </Link>
                        )}

                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsAccountOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 hover:bg-neutral-50 hover:text-[#FF5C00] transition-colors"
                          >
                            <Shield className="w-4 h-4 text-blue-600" />
                            Bảng điều khiển Quản trị (Admin)
                          </Link>
                        )}

                        {user.role === 'cskh' && (
                          <Link
                            to="/cskh"
                            onClick={() => setIsAccountOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 hover:bg-neutral-50 hover:text-[#FF5C00] transition-colors"
                          >
                            <Headphones className="w-4 h-4 text-purple-600" />
                            Bàn làm việc CSKH
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-neutral-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left cursor-pointer transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Đăng xuất
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shopping Cart Link */}
              <Link
                to="/cart"
                className="flex items-center gap-2 font-medium text-neutral-800 hover:text-[#FF5C00] transition-colors relative py-1"
              >
                <div className="relative flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-neutral-800" />
                  <CartBadgePulse count={itemCount} className="absolute -top-1.5 -right-2" />
                </div>
                <span className="hidden sm:inline font-semibold text-[13.5px]">Giỏ hàng</span>
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-1 text-neutral-700 hover:text-neutral-900"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Navigation Row: Categories & Hotlinks */}
          <div className="hidden sm:flex items-center justify-between border-t border-neutral-100 py-2.5 text-[13px] font-medium text-neutral-700">
            {/* All Categories Button */}
            <Link
              to="/categories"
              className="flex items-center gap-2 text-[#FF5C00] font-semibold hover:opacity-90 flex-shrink-0"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Tất cả danh mục</span>
            </Link>

            {/* Main Categories Horizontal Bar */}
            <nav className="flex items-center space-x-6 overflow-x-auto no-scrollbar font-normal text-neutral-700">
              {topCategories.length > 0 ? (
                topCategories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/products?category=${cat._id}`}
                    className={`hover:text-[#FF5C00] transition-colors whitespace-nowrap ${
                      location.search.includes(cat._id) ? 'text-[#FF5C00] font-semibold' : ''
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))
              ) : (
                <div className="flex items-center space-x-6">
                  {['Điện thoại', 'Laptop', 'Linh kiện PC', 'Phụ kiện'].map((name, i) => (
                    <span key={i} className="text-neutral-400 text-sm whitespace-nowrap">{name}</span>
                  ))}
                </div>
              )}
            </nav>

            {/* Promotion Hotlink */}
            <Link
              to="/promotions"
              className="text-[#FF5C00] font-semibold hover:opacity-90 whitespace-nowrap flex items-center gap-1 flex-shrink-0"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Khuyến mãi</span>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Drawer with Fluid Slide */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              variants={fadeSlideDownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="sm:hidden border-t border-neutral-200 bg-white px-4 py-3 space-y-3 shadow-md"
            >
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full pl-9 pr-4 py-2 bg-neutral-100 rounded-lg text-sm border-none outline-none focus:ring-1 focus:ring-[#FF5C00]"
                />
              </form>
              <div className="space-y-1 pt-1 border-t border-neutral-100">
                <Link
                  to="/categories"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-sm font-semibold text-[#FF5C00]"
                >
                  Tất cả danh mục
                </Link>
                {topCategories.map((c) => (
                  <Link
                    key={c._id}
                    to={`/products?category=${c._id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-1.5 text-sm text-neutral-700 hover:text-[#FF5C00] transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Outlet with Page Transition */}
      <main className="flex-1 w-full bg-[#FFFFFF]">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      {/* Main Footer — Monolith Swiss Editorial */}
      <footer className="w-full bg-[#FAFAFA] border-t border-neutral-200 pt-12 pb-8 mt-12">
        <div className="max-w-[1320px] mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10 text-[13px]">
            {/* Col 1: Brand Info */}
            <div className="col-span-2 md:col-span-1 space-y-3.5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-[#FF5C00] rounded-full" />
                <span className="font-black text-[19px] tracking-tight text-neutral-950 font-sans">
                  TECHSTORE
                </span>
              </div>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Hệ sinh thái công nghệ kiến tạo tương lai. Cam kết 100% phần cứng chính hãng, trải nghiệm tiêu chuẩn công nghiệp.
              </p>
              <div className="pt-1 text-xs text-neutral-600 space-y-1 font-mono">
                <p>Hotline: 1800-8888</p>
                <p>Email: contact@techstore.vn</p>
              </div>
            </div>

            {/* Col 2: Về chúng tôi */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-neutral-900 text-sm tracking-tight">Về chúng tôi</h4>
              <ul className="space-y-2 text-neutral-600 text-xs">
                <li><Link to="/about" className="hover:text-[#FF5C00] transition-colors">Giới thiệu TECHSTORE</Link></li>
                <li><Link to="/careers" className="hover:text-[#FF5C00] transition-colors">Tuyển dụng nhân tài</Link></li>
                <li><Link to="/stores" className="hover:text-[#FF5C00] transition-colors">Hệ thống showroom</Link></li>
                <li><Link to="/terms" className="hover:text-[#FF5C00] transition-colors">Quy chế hoạt động</Link></li>
              </ul>
            </div>

            {/* Col 3: Hỗ trợ khách hàng */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-neutral-900 text-sm tracking-tight">Hỗ trợ khách hàng</h4>
              <ul className="space-y-2 text-neutral-600 text-xs">
                <li><Link to="/help" className="hover:text-[#FF5C00] transition-colors">Trung tâm trợ giúp</Link></li>
                <li><Link to="/help" className="hover:text-[#FF5C00] transition-colors">Hướng dẫn đặt hàng</Link></li>
                <li><Link to="/help" className="hover:text-[#FF5C00] transition-colors">Phương thức thanh toán</Link></li>
                <li><Link to="/contact" className="hover:text-[#FF5C00] transition-colors">Gửi khiếu nại CSKH</Link></li>
              </ul>
            </div>

            {/* Col 4: Chính sách */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-neutral-900 text-sm tracking-tight">Chính sách</h4>
              <ul className="space-y-2 text-neutral-600 text-xs">
                <li><Link to="/policies/returns" className="hover:text-[#FF5C00] transition-colors">Chính sách đổi trả 7 ngày</Link></li>
                <li><Link to="/policies/warranty" className="hover:text-[#FF5C00] transition-colors">Chính sách bảo hành phần cứng</Link></li>
                <li><Link to="/policies/privacy" className="hover:text-[#FF5C00] transition-colors">Chính sách bảo mật thông tin</Link></li>
                <li><Link to="/policies/shipping" className="hover:text-[#FF5C00] transition-colors">Chính sách giao nhận & kiểm hàng</Link></li>
              </ul>
            </div>

            {/* Col 5: Kết nối & Chứng nhận */}
            <div className="col-span-2 md:col-span-1 space-y-3.5">
              <h4 className="font-bold text-neutral-900 text-sm tracking-tight">Kênh bán hàng</h4>
              <p className="text-xs text-neutral-600">
                Bạn là nhà phân phối hoặc thương hiệu công nghệ?
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <Store className="w-3.5 h-3.5 text-[#FF5C00]" />
                Đăng ký mở gian hàng
              </Link>
            </div>
          </div>

          {/* Bottom Copyright Row */}
          <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-3">
            <p>© 2026 TECHSTORE. Nền tảng thương mại điện tử công nghệ chuẩn MONOLITH.</p>
            <div className="flex items-center gap-4 text-neutral-500">
              <span>Bảo mật SSL 256-bit</span>
              <span>•</span>
              <span>Thanh toán chuẩn Quốc gia</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
