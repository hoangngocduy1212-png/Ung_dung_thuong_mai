import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  ArrowLeft,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Store,
  FolderTree,
  Headphones,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Build role-specific sidebar items
  const getNavItems = (): { title: string; items: NavItem[] } => {
    switch (user?.role) {
      case 'admin':
        return {
          title: 'Admin Console',
          items: [
            { label: 'Tổng quan Admin', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
            { label: 'Duyệt Gian Hàng', path: '/admin/shops', icon: <Store className="w-4 h-4" /> },
            { label: 'Quản Lý Người Dùng', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
            { label: 'Danh Mục & Thương Hiệu', path: '/admin/catalogs', icon: <FolderTree className="w-4 h-4" /> },
          ],
        };
      case 'seller':
        return {
          title: 'Seller Center',
          items: [
            { label: 'Tổng quan Gian Hàng', path: '/seller', icon: <LayoutDashboard className="w-4 h-4" /> },
            { label: 'Quản Lý Sản Phẩm', path: '/seller/products', icon: <Package className="w-4 h-4" /> },
            { label: 'Quản Lý Đơn Hàng', path: '/seller/orders', icon: <ShoppingBag className="w-4 h-4" /> },
          ],
        };
      case 'cskh':
        return {
          title: 'Cổng CSKH & Hỗ Trợ',
          items: [
            { label: 'Bàn Làm Việc CSKH', path: '/staff', icon: <Headphones className="w-4 h-4" /> },
            { label: 'Khiếu Nại & Tranh Chấp', path: '/staff/disputes', icon: <ShieldCheck className="w-4 h-4" /> },
          ],
        };
      default:
        return {
          title: 'Bảng Điều Khiển',
          items: [
            { label: 'Trang cá nhân', path: '/profile', icon: <Users className="w-4 h-4" /> },
            { label: 'Đơn mua của tôi', path: '/orders', icon: <ShoppingBag className="w-4 h-4" /> },
          ],
        };
    }
  };

  const navConfig = getNavItems();

  return (
    <div className="min-h-screen flex bg-[#f5f8fc]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#e6edf5] flex flex-col shrink-0">
        {/* Brand in Sidebar */}
        <div className="h-16 px-6 border-b border-[#e6edf5] flex items-center justify-between">
          <Link to="/" className="font-bold text-lg text-[#1267d5] flex items-center gap-2">
            <span>TechStore</span>
            <Badge role={user?.role} size="sm" />
          </Link>
        </div>

        {/* Portal Title & Back to Storefront */}
        <div className="p-4 border-b border-[#e6edf5]">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#78889b] mb-2">
            {navConfig.title}
          </h2>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-[#1267d5] hover:underline font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về Cửa Hàng Mua Sắm</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1">
          {navConfig.items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#e9f3ff] text-[#1267d5]'
                    : 'text-[#17283e] hover:bg-slate-50'
                }`}
              >
                <span className={isActive ? 'text-[#1267d5]' : 'text-[#78889b]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card at bottom of Sidebar */}
        <div className="p-4 border-t border-[#e6edf5] bg-slate-50/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#1267d5] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#17283e] truncate">{user?.name}</p>
              <p className="text-[11px] text-[#78889b] truncate">{user?.email}</p>
            </div>
          </div>
          {user?.role !== 'cskh' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-3.5 h-3.5 text-red-500" />}
              className="w-full text-xs justify-center hover:bg-red-50 hover:text-red-700 hover:border-red-200"
            >
              Đăng xuất
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-[#e6edf5] px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#17283e]">
              Phân hệ: {navConfig.title}
            </span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
