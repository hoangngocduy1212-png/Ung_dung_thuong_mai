import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { PageTransition } from '../../lib/motion';
import { useAuth } from '../../hooks/useAuth';
import { sellerService } from '../../services/sellerService';
import type { SellerShop } from '../../types/seller';
import {
  LayoutDashboard,
  Package,
  ReceiptText,
  Tag,
  RotateCcw,
  Store,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export const SellerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [shop, setShop] = useState<SellerShop | null>(null);

  useEffect(() => {
    sellerService
      .getShop()
      .then((data) => setShop(data))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { to: '/seller', label: 'Tổng quan', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/seller/products', label: 'Sản phẩm & Tồn kho', icon: <Package className="w-4 h-4" /> },
    { to: '/seller/orders', label: 'Quản lý đơn hàng', icon: <ReceiptText className="w-4 h-4" /> },
    { to: '/seller/vouchers', label: 'Khuyến mãi & Voucher', icon: <Tag className="w-4 h-4" /> },
    { to: '/seller/after-sales', label: 'Hậu mãi & Đổi trả', icon: <RotateCcw className="w-4 h-4" /> },
    { to: '/seller/settings', label: 'Cài đặt gian hàng', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-neutral-900 font-sans flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-xs">
        <div className="w-full px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo Brand + Seller Studio Pill */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-1.5 font-black text-xl tracking-tight text-neutral-950">
              TECHSTORE
            </Link>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]" />
            <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-xs font-mono font-semibold uppercase tracking-wider">
              Seller Studio
            </span>
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center gap-5">
            <Link
              to="/"
              className="text-xs text-neutral-600 hover:text-[#FF5C00] font-medium flex items-center gap-1 transition"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Xem Storefront</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </Link>

            {shop && (
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                shop.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {shop.status === 'active' ? 'Đang hoạt động' : 'Chờ phê duyệt'}
              </span>
            )}

            <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
              <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                {(user?.fullName || user?.name || 'S')[0].toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-neutral-900 hidden sm:inline max-w-[120px] truncate">
                {user?.fullName || user?.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Grid: Sidebar Left (64/72) & Content Right */}
      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col justify-between p-4 flex-shrink-0">
          <div className="space-y-4">
            {/* Shop info mini box */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
              <div className="text-[11px] text-neutral-400 font-mono uppercase tracking-wider">
                Gian hàng
              </div>
              <div className="font-bold text-xs text-neutral-900 truncate mt-0.5">
                {shop?.name || 'Cửa hàng của tôi'}
              </div>
            </div>

            {/* Nav items */}
            <nav className="space-y-1 text-xs">
              {navItems.map((item) => {
                const isActive =
                  item.to === '/seller'
                    ? location.pathname === '/seller'
                    : location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium ${
                      isActive
                        ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    <span className={isActive ? 'text-[#FF5C00]' : 'text-neutral-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Logout */}
          <div className="pt-4 border-t border-neutral-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-600 hover:bg-red-50 font-medium transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* Content Outlet with Page Transition */}
        <main className="flex-1 p-6 sm:p-8 max-w-[1240px]">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
};
