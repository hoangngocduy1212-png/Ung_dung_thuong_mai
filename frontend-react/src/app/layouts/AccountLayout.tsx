import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Package,
  MapPin,
  User,
  Heart,
  Bell,
  LogOut,
  Award,
} from 'lucide-react';

export const AccountLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { to: '/account', label: 'Tổng quan', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/account/orders', label: 'Lịch sử đơn hàng', icon: <Package className="w-4 h-4" /> },
    { to: '/account/addresses', label: 'Sổ địa chỉ', icon: <MapPin className="w-4 h-4" /> },
    { to: '/account/profile', label: 'Thông tin cá nhân', icon: <User className="w-4 h-4" /> },
    { to: '/account/wishlist', label: 'Sản phẩm yêu thích', icon: <Heart className="w-4 h-4" /> },
    { to: '/account/notifications', label: 'Thông báo', icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-[1320px] mx-auto px-4 lg:px-6 py-6 pb-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-neutral-500 mb-6 font-mono">
        <Link to="/" className="hover:text-neutral-900">Trang chủ</Link>
        <span>/</span>
        <span className="text-neutral-900 font-semibold">Tài khoản khách hàng</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Navigation (3 cols) */}
        <aside className="lg:col-span-3 bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-6">
          {/* User Profile Mini Badge */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-base flex-shrink-0">
              {(user?.fullName || user?.name || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm text-neutral-900 truncate">
                {user?.fullName || user?.name || 'Khách hàng'}
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-[#FF5C00] font-mono font-semibold mt-0.5">
                <Award className="w-3.5 h-3.5" />
                <span>{user?.points || 0} Điểm thưởng</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs sm:text-sm">
            {navItems.map((item) => {
              const isActive =
                item.to === '/account'
                  ? location.pathname === '/account'
                  : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all font-medium ${
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

          {/* Logout */}
          <div className="pt-4 border-t border-neutral-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm text-red-600 hover:bg-red-50 font-medium transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* Right Content Area (9 cols) */}
        <main className="lg:col-span-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
