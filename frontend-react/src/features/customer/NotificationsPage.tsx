import React from 'react';
import { Package, Tag, ShieldCheck } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: '1',
    title: 'Đơn hàng #DH00001 đang được vận chuyển',
    desc: 'Đơn vị vận chuyển GHN Express đã nhận hàng và đang trên đường giao tới bạn.',
    time: '2 giờ trước',
    icon: <Package className="w-5 h-5 text-[#FF5C00]" />,
    unread: true,
  },
  {
    id: '2',
    title: 'Nhận ngay Voucher giảm giá 50.000 ₫',
    desc: 'Mã TECH50K đã được thêm vào ví voucher của bạn. Áp dụng cho đơn hàng từ 500.000 ₫.',
    time: '1 ngày trước',
    icon: <Tag className="w-5 h-5 text-emerald-600" />,
    unread: false,
  },
  {
    id: '3',
    title: 'Bảo mật tài khoản: Đăng nhập thành công',
    desc: 'Hệ thống ghi nhận phiên đăng nhập từ thiết bị mới. Nếu không phải bạn, hãy đổi mật khẩu ngay.',
    time: '3 ngày trước',
    icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
    unread: false,
  },
];

export const NotificationsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
          Thông báo tài khoản
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Cập nhật các biến động về đơn hàng, ưu đãi và cảnh báo an toàn từ TECHSTORE
        </p>
      </div>

      <div className="space-y-3">
        {NOTIFICATIONS.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border transition flex items-start gap-4 ${
              item.unread
                ? 'bg-orange-50/30 border-orange-200 shadow-xs'
                : 'bg-white border-neutral-200'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0 shadow-xs">
              {item.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-xs sm:text-sm text-neutral-900 leading-snug">
                  {item.title}
                </h3>
                <span className="text-[11px] text-neutral-400 font-mono whitespace-nowrap">
                  {item.time}
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
