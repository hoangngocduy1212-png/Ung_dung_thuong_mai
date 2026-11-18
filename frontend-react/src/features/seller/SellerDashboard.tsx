import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sellerService } from '../../services/sellerService';
import type { SellerStats } from '../../types/seller';
import type { Order } from '../../types/order';
import { Loading } from '../../components/common/Loading';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Star,
  ArrowRight,
  Store,
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([sellerService.getStats(), sellerService.getOrders({ limit: 5 })]).then(
      ([statsRes, ordersRes]) => {
        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value);
        }
        if (ordersRes.status === 'fulfilled') {
          setRecentOrders(ordersRes.value.items || []);
        }
        setLoading(false);
      }
    );
  }, []);

  const formatPrice = (val?: number) => {
    if (typeof val !== 'number') return '0 ₫';
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  if (loading) {
    return (
      <div className="py-20">
        <Loading message="Đang tải dữ liệu Seller Studio..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Top Welcome Card */}
      <section className="bg-white rounded-xl p-6 sm:p-8 border border-neutral-200 shadow-xs flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-800 border border-neutral-200">
          <Store className="w-8 h-8 text-[#FF5C00]" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Xin chào! Bảng điều khiển Seller Studio
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-3xl leading-relaxed">
            Chào mừng bạn đến với Seller Studio. Quản lý danh mục sản phẩm, biến thể kho và xử lý đơn hàng của bạn trên TECHSTORE một cách trực quan và đồng bộ.
          </p>
        </div>
      </section>

      {/* 2. 4 KPI Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh thu */}
        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF5C00] flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-neutral-500 font-medium">Doanh thu bán hàng</p>
            <p className="text-lg font-extrabold text-neutral-900 font-mono tracking-tight truncate">
              {formatPrice(stats?.revenue || 0)}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium">+12% so với kỳ trước</span>
          </div>
        </div>

        {/* Đơn hàng mới */}
        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF5C00] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-neutral-500 font-medium">Tổng đơn hàng</p>
            <p className="text-xl font-extrabold text-neutral-900 font-mono tracking-tight">
              {stats?.orderCount || 0}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium">+8% so với kỳ trước</span>
          </div>
        </div>

        {/* Sản phẩm */}
        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF5C00] flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-neutral-500 font-medium">Sản phẩm đang bán</p>
            <p className="text-xl font-extrabold text-neutral-900 font-mono tracking-tight">
              {stats?.productCount || 0}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium">Đang trực tuyến</span>
          </div>
        </div>

        {/* Đánh giá */}
        <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF5C00] flex items-center justify-center shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-neutral-500 font-medium">Đánh giá cửa hàng</p>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold text-neutral-900 font-mono">
                {stats?.ratingAvg ? stats.ratingAvg.toFixed(1) : '5.0'}
              </span>
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
            </div>
            <span className="text-[11px] text-neutral-400">Tiêu chuẩn đối tác</span>
          </div>
        </div>
      </section>

      {/* 3. Trend Vector Chart */}
      <section className="bg-white rounded-xl p-6 border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <h3 className="text-sm font-bold text-neutral-900">Doanh thu theo thời gian</h3>
          <span className="text-xs font-mono text-neutral-400">7 ngày gần nhất</span>
        </div>

        {/* Vector SVG Chart matching Stitch exactly */}
        <div className="w-full h-56 pt-2 relative flex flex-col justify-between">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 740 200">
            <defs>
              <linearGradient id="sellerChartGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#FF5C00" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FF5C00" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <line stroke="#F3F4F6" strokeWidth="1" x1="40" x2="720" y1="20" y2="20" />
            <line stroke="#F3F4F6" strokeWidth="1" x1="40" x2="720" y1="65" y2="65" />
            <line stroke="#F3F4F6" strokeWidth="1" x1="40" x2="720" y1="110" y2="110" />
            <line stroke="#F3F4F6" strokeWidth="1" x1="40" x2="720" y1="155" y2="155" />
            <line stroke="#F3F4F6" strokeWidth="1" x1="40" x2="720" y1="190" y2="190" />

            <path
              d="M 60 150 L 160 140 L 260 145 L 360 115 L 460 135 L 560 110 L 640 90 L 720 70 L 720 190 L 60 190 Z"
              fill="url(#sellerChartGrad)"
            />
            <path
              d="M 60 150 L 160 140 L 260 145 L 360 115 L 460 135 L 560 110 L 640 90 L 720 70"
              fill="none"
              stroke="#FF5C00"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />
            {[
              { x: 60, y: 150 },
              { x: 160, y: 140 },
              { x: 260, y: 145 },
              { x: 360, y: 115 },
              { x: 460, y: 135 },
              { x: 560, y: 110 },
              { x: 640, y: 90 },
              { x: 720, y: 70 },
            ].map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                className="fill-[#FF5C00] stroke-white stroke-2"
              />
            ))}
          </svg>
          <div className="flex justify-between pl-10 pr-2 pt-2 text-neutral-400 font-mono text-[11px]">
            <span>Thứ 2</span>
            <span>Thứ 3</span>
            <span>Thứ 4</span>
            <span>Thứ 5</span>
            <span>Thứ 6</span>
            <span>Thứ 7</span>
            <span>Chủ Nhật</span>
            <span>Hôm nay</span>
          </div>
        </div>
      </section>

      {/* 4. Recent Orders Table */}
      <section className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h3 className="text-sm font-bold text-neutral-900">Đơn hàng cần xử lý</h3>
          <Link
            to="/seller/orders"
            className="text-xs text-[#FF5C00] font-semibold hover:underline flex items-center gap-1"
          >
            <span>Quản lý toàn bộ đơn</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            Hiện tại không có đơn hàng nào chờ xử lý.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-100 font-mono">
                  <th className="py-3 px-6">Mã đơn</th>
                  <th className="py-3 px-4">Ngày đặt</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Doanh thu nhận</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-neutral-50/50 transition">
                    <td className="py-4 px-6 font-mono font-bold text-neutral-900">
                      #{ord.code}
                    </td>
                    <td className="py-4 px-4 font-mono text-neutral-500">
                      {new Date(ord.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-4 px-4 text-neutral-800">
                      {typeof ord.customer === 'object' ? ord.customer.fullName : 'Khách hàng'}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-[#FF5C00]">
                      {formatPrice(ord.sellerRevenue || ord.total)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-orange-50 text-[#FF5C00] border border-orange-200 uppercase">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to="/seller/orders"
                        className="text-xs font-semibold text-neutral-800 hover:text-[#FF5C00]"
                      >
                        Xử lý đơn
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
