import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

const NAV_ITEMS = [
  {
    to: '/admin',
    end: true,
    label: 'Tổng quan',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    to: '/admin/users',
    label: 'Người dùng',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    to: '/admin/shops',
    label: 'Cửa hàng',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    to: '/admin/products',
    label: 'Sản phẩm',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    to: '/admin/categories',
    label: 'Danh mục',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    to: '/admin/brands',
    label: 'Thương hiệu',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    to: '/admin/orders',
    label: 'Đơn hàng',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    to: '/admin/vouchers',
    label: 'Voucher',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
  },
  {
    to: '/admin/complaints',
    label: 'Khiếu nại',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    to: '/admin/staff',
    label: 'Nhân viên CSKH',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans text-neutral-900 flex antialiased">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col justify-between fixed top-0 bottom-0 left-0 z-40 select-none">
        <div className="flex flex-col h-full">
          {/* Logo Brand */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-neutral-200 shrink-0">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#171717] flex items-center justify-center text-[#FF5C00] font-mono font-bold text-sm">
                TS
              </div>
              <div className="leading-tight">
                <span className="text-sm font-bold tracking-tight text-neutral-900 block font-mono">TECHSTORE</span>
                <span className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">Admin Portal</span>
              </div>
            </Link>
          </div>

          {/* Section Label */}
          <div className="px-5 pt-4 pb-2 text-[10px] font-mono uppercase tracking-widest text-neutral-400">
            Hệ thống quản trị
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-neutral-900 text-white font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                  }`
                }
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer Status */}
          <div className="p-4 border-t border-neutral-200 bg-neutral-50/50 flex items-center justify-between font-mono text-[11px] text-neutral-500">
            <span>SYS.STATUS</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ONLINE
            </span>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-neutral-200 sticky top-0 z-30 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs text-neutral-400 font-mono">TECHSTORE Engine v2.4</span>
            <span className="text-neutral-200">|</span>
            <Link to="/" className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Xem Storefront
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* User Badge */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-neutral-900 text-white flex items-center justify-center font-bold text-xs font-mono">
                {(user?.fullName || user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-neutral-900 leading-tight">{user?.fullName || user?.name || 'Administrator'}</div>
                <div className="text-[10px] font-mono text-[#FF5C00] uppercase font-bold leading-tight">Superadmin</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs text-neutral-500 hover:text-red-600 font-medium px-2.5 py-1 rounded border border-neutral-200 hover:border-red-200 hover:bg-red-50/50 transition-colors"
              title="Đăng xuất khỏi hệ thống quản trị"
            >
              Đăng xuất
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
