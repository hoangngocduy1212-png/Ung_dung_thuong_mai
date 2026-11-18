import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CskhDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="w-full max-w-[1320px] mx-auto px-4 lg:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-[#17283e]">Cổng Hỗ Trợ Khách Hàng (CSKH Portal)</h1>
            <Badge role="cskh" size="sm" />
          </div>
          <p className="text-sm text-[#78889b]">
            Nhân viên hỗ trợ: <span className="font-semibold text-[#17283e]">{user?.fullName || user?.name}</span> • Tiếp nhận & xử lý yêu cầu khiếu nại
          </p>
        </div>
      </div>

      {/* Workstation Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:border-amber-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#78889b]">TIẾP NHẬN YÊU CẦU</span>
            <MessageSquare className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-[#17283e] mb-1">Hàng Đợi Vé Hỗ Trợ</h3>
          <p className="text-xs text-[#78889b] mb-4">
            Theo dõi danh sách các ticket hỗ trợ từ khách hàng, phản hồi giải đáp thắc mắc về đơn hàng, vận chuyển và sản phẩm lỗi.
          </p>
        </Card>

        <Card className="hover:border-amber-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#78889b]">TRANH CHẤP & HOÀN TIỀN</span>
            <ShieldAlert className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-[#17283e] mb-1">Xử Lý Khiếu Nại Đơn Hàng</h3>
          <p className="text-xs text-[#78889b] mb-4">
            Điều tra bằng chứng khiếu nại giao trễ, hàng vỡ hỏng, trung gian hòa giải và chuyển hồ sơ lên Quản trị viên khi cần phân xử.
          </p>
          <Link to="/staff/disputes">
            <Button variant="outline" size="sm" className="w-full text-xs">
              Xem Phân Hệ Tranh Chấp Placeholder
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};
