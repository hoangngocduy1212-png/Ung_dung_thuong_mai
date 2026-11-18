import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { adminService } from '../../services/adminService';
import { createStaggerContainer, staggerItemVariants } from '../../lib/motion';
import type { AdminStats } from '../../types/admin';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminService.getStats();
        setStats(data);
      } catch (err: any) {
        console.error('Fetch admin stats error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono mb-1">
            <span>QUẢN TRỊ</span>
            <span>/</span>
            <span className="text-neutral-900 font-semibold">TỔNG QUAN</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Tổng quan Marketplace</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Báo cáo hiệu suất kinh doanh, quy mô người dùng và tình trạng vận hành nền tảng TECHSTORE.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-neutral-100 text-neutral-600 font-mono text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            SYS.SYNC: LIVE
          </span>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <motion.div
        variants={createStaggerContainer(0.05)}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* GMV */}
        <motion.div
          variants={staggerItemVariants}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18 }}
          className="bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs hover:border-neutral-300 transition-shadow"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-semibold text-neutral-700">Tổng GD (GMV)</span>
            <span className="text-[10px] font-mono uppercase bg-neutral-100 px-1.5 py-0.5 rounded">METRIC_GMV</span>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900">
            {loading ? '—' : `${(stats?.gmv || stats?.revenue || 0).toLocaleString('vi-VN')}₫`}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2 flex items-center justify-between">
            <span>Tổng đơn thành công:</span>
            <span className="font-mono font-medium text-neutral-700">{stats?.orderCount || 0}</span>
          </div>
        </motion.div>

        {/* Khách hàng */}
        <motion.div
          variants={staggerItemVariants}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18 }}
          className="bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs hover:border-neutral-300 transition-shadow"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-semibold text-neutral-700">Khách hàng</span>
            <span className="text-[10px] font-mono uppercase bg-neutral-100 px-1.5 py-0.5 rounded">ENT_USERS</span>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900">
            {loading ? '—' : stats?.totals?.customers || 0}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2 flex items-center justify-between">
            <span>Tài khoản đã đăng ký</span>
            <Link to="/admin/users" className="text-[#FF5C00] font-semibold hover:underline">Chi tiết →</Link>
          </div>
        </motion.div>

        {/* Cửa hàng */}
        <motion.div
          variants={staggerItemVariants}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18 }}
          className="bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs hover:border-neutral-300 transition-shadow"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-semibold text-neutral-700">Cửa hàng đối tác</span>
            <span className="text-[10px] font-mono uppercase bg-neutral-100 px-1.5 py-0.5 rounded">ENT_SHOPS</span>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900">
            {loading ? '—' : stats?.totals?.activeShops || 0}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2 flex items-center justify-between">
            <span className="text-amber-700 font-medium">Chờ duyệt: {stats?.totals?.pendingShops || 0}</span>
            <Link to="/admin/shops" className="text-[#FF5C00] font-semibold hover:underline">Duyệt →</Link>
          </div>
        </motion.div>

        {/* Khiếu nại */}
        <motion.div
          variants={staggerItemVariants}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18 }}
          className="bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs hover:border-neutral-300 transition-shadow"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-semibold text-neutral-700">Khiếu nại chờ Admin</span>
            <span className="text-[10px] font-mono uppercase bg-red-100 text-red-700 px-1.5 py-0.5 rounded">ESCALATED</span>
          </div>
          <div className={`text-2xl font-bold font-mono ${stats?.totals?.complaintsWaitingAdmin ? 'text-red-600' : 'text-neutral-900'}`}>
            {loading ? '—' : stats?.totals?.complaintsWaitingAdmin || 0}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2 flex items-center justify-between">
            <span>Trọng tài can thiệp</span>
            <Link to="/admin/complaints" className="text-red-600 font-semibold hover:underline">Xử lý ngay →</Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Grid: Top Shops & Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Shops Column (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-lg p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Bảng xếp hạng Gian hàng nổi bật</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Top gian hàng có doanh số bán hàng cao nhất trên nền tảng</p>
            </div>
            <Link to="/admin/shops" className="text-xs text-[#FF5C00] font-semibold hover:underline">
              Xem toàn bộ ({stats?.totals?.activeShops || 0})
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-neutral-400 font-mono">Đang phân tích doanh số các gian hàng...</div>
          ) : !stats?.topShops || stats.topShops.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400">Chưa ghi nhận đơn hàng hoàn tất nào phát sinh doanh thu.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Hạng</th>
                    <th className="py-2.5 px-3">Gian hàng</th>
                    <th className="py-2.5 px-3 text-right">Doanh số ghi nhận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {stats.topShops.map((item, idx) => (
                    <tr key={item.shop} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">
                        {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-neutral-900">
                        {item.name}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#FF5C00]">
                        {item.revenue.toLocaleString('vi-VN')}₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending Actions Column (1 col) */}
        <div className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-2xs">
            <h3 className="font-bold text-neutral-900 text-sm mb-1">Tác vụ cần xử lý ngay</h3>
            <p className="text-xs text-neutral-500 mb-4">Các yêu cầu từ người bán và tranh chấp khách hàng</p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50/80 rounded border border-amber-200/80 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-amber-900">Hồ sơ gian hàng mới</div>
                  <div className="text-[11px] text-amber-700">{stats?.totals?.pendingShops || 0} đối tác đang chờ duyệt</div>
                </div>
                <Link
                  to="/admin/shops"
                  className="px-2.5 py-1 bg-amber-600 text-white rounded text-[11px] font-semibold hover:bg-amber-700 transition-colors"
                >
                  Xem
                </Link>
              </div>

              <div className="p-3 bg-red-50/80 rounded border border-red-200/80 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-red-900">Khiếu nại chuyển Admin</div>
                  <div className="text-[11px] text-red-700">{stats?.totals?.complaintsWaitingAdmin || 0} tranh chấp cần phân xử</div>
                </div>
                <Link
                  to="/admin/complaints"
                  className="px-2.5 py-1 bg-red-600 text-white rounded text-[11px] font-semibold hover:bg-red-700 transition-colors"
                >
                  Phân xử
                </Link>
              </div>
            </div>
          </div>

          {/* Quick System Links */}
          <div className="bg-neutral-900 text-white rounded-lg p-5 shadow-2xs text-xs space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">Phím tắt quản trị</div>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/admin/categories" className="p-2 bg-neutral-800 rounded hover:bg-neutral-700 text-neutral-200 font-medium">
                + Thêm danh mục
              </Link>
              <Link to="/admin/brands" className="p-2 bg-neutral-800 rounded hover:bg-neutral-700 text-neutral-200 font-medium">
                + Thêm thương hiệu
              </Link>
              <Link to="/admin/vouchers" className="p-2 bg-neutral-800 rounded hover:bg-neutral-700 text-neutral-200 font-medium">
                + Tạo Voucher sàn
              </Link>
              <Link to="/admin/staff" className="p-2 bg-neutral-800 rounded hover:bg-neutral-700 text-neutral-200 font-medium">
                + Thêm CSKH
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
