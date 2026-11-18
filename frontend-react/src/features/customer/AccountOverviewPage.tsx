import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { customerService } from '../../services/customerService';
import type { Order } from '../../types/order';
import type { PointsSummary } from '../../types/customer';
import {
  Package,
  Award,
  MapPin,
  ArrowRight,
  Truck,
  ExternalLink,
} from 'lucide-react';

export const AccountOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pointsData, setPointsData] = useState<PointsSummary | null>(null);
  const [addressCount, setAddressCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      customerService.getOrders({ limit: 5 }),
      customerService.getPoints(),
      customerService.getAddresses(),
    ]).then(([orderRes, pointsRes, addrRes]) => {
      if (orderRes.status === 'fulfilled') {
        setOrders(orderRes.value.items || []);
      }
      if (pointsRes.status === 'fulfilled') {
        setPointsData(pointsRes.value);
      }
      if (addrRes.status === 'fulfilled') {
        setAddressCount(addrRes.value.length || 0);
      }
      setLoading(false);
    });
  }, []);

  const formatPrice = (val?: number) => {
    if (typeof val !== 'number') return '0 ₫';
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  const pendingOrders = orders.filter((o) => o.status === 'cho_xac_nhan' || o.status === 'da_xac_nhan');
  const shippingOrders = orders.filter((o) => o.status === 'dang_giao');

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-neutral-400">
        Đang tải thông tin tài khoản...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#FF5C00] bg-orange-50 px-2.5 py-0.5 rounded">
            <span>TÀI KHOẢN KHÁCH HÀNG CHÍNH THỨC</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Xin chào, {user?.fullName || 'Khách hàng'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-xl leading-relaxed">
            Chào mừng bạn đến với trung tâm quản trị tài khoản TECHSTORE. Theo dõi trạng thái đơn hàng, sổ địa chỉ và điểm thưởng thành viên.
          </p>
        </div>

        <Link
          to="/account/profile"
          className="px-4 py-2 rounded-lg border border-neutral-300 hover:border-[#FF5C00] text-xs font-semibold text-neutral-800 hover:text-[#FF5C00] transition flex-shrink-0"
        >
          Chỉnh sửa hồ sơ
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Card 1: Orders */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">Đơn mua</span>
            <Package className="w-4 h-4 text-[#FF5C00]" />
          </div>
          <div className="text-2xl font-extrabold text-neutral-900 font-mono">
            {orders.length}
          </div>
          <div className="text-[11px] text-neutral-400">
            {pendingOrders.length} đơn đang xử lý
          </div>
        </div>

        {/* Card 2: Points */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">Điểm tích lũy</span>
            <Award className="w-4 h-4 text-[#FF5C00]" />
          </div>
          <div className="text-2xl font-extrabold text-neutral-900 font-mono">
            {pointsData?.points ?? user?.points ?? 0}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            Hạng Platinum VIP
          </div>
        </div>

        {/* Card 3: Shipping */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">Đang vận chuyển</span>
            <Truck className="w-4 h-4 text-[#FF5C00]" />
          </div>
          <div className="text-2xl font-extrabold text-neutral-900 font-mono">
            {shippingOrders.length}
          </div>
          <div className="text-[11px] text-neutral-400">
            Đơn hàng đang giao
          </div>
        </div>

        {/* Card 4: Addresses */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">Địa chỉ lưu</span>
            <MapPin className="w-4 h-4 text-[#FF5C00]" />
          </div>
          <div className="text-2xl font-extrabold text-neutral-900 font-mono">
            {addressCount}
          </div>
          <div className="text-[11px] text-neutral-400">
            Sổ địa chỉ nhận hàng
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <section className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#FF5C00]" />
            <h2 className="text-sm font-bold text-neutral-900">Đơn hàng gần đây</h2>
          </div>
          <Link
            to="/account/orders"
            className="text-xs text-[#FF5C00] font-semibold hover:underline flex items-center gap-1"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            Bạn chưa có đơn đặt hàng nào gần đây.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-100 font-mono">
                  <th className="py-3 px-6">Mã đơn</th>
                  <th className="py-3 px-4">Ngày đặt</th>
                  <th className="py-3 px-4 text-center">Số món</th>
                  <th className="py-3 px-4">Tổng tiền</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-6 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-neutral-50/50 transition">
                    <td className="py-4 px-6 font-mono font-bold text-neutral-900">
                      {ord.code}
                    </td>
                    <td className="py-4 px-4 text-neutral-500 font-mono">
                      {new Date(ord.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-4 px-4 text-center font-mono">
                      {ord.items?.length || 1}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-[#FF5C00]">
                      {formatPrice(ord.total)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-orange-50 text-[#FF5C00] border border-orange-200 uppercase">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/orders/${ord._id}/tracking`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-800 hover:text-[#FF5C00]"
                      >
                        <span>Theo dõi</span>
                        <ExternalLink className="w-3 h-3" />
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
