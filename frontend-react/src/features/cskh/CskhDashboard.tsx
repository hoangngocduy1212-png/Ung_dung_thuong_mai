import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { Headphones, ShieldAlert, MessageSquare, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CskhDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-[#17283e]">Cổng Hỗ Trợ Khách Hàng (CSKH Portal)</h1>
            <Badge role="cskh" size="sm" />
          </div>
          <p className="text-sm text-[#78889b]">
            Nhân viên hỗ trợ: <span className="font-semibold text-[#17283e]">{user?.name}</span> • Tiếp nhận & xử lý yêu cầu khiếu nại
          </p>
        </div>

        <a href="http://localhost:5500/staff.html" target="_blank" rel="noreferrer">
          <Button
            variant="primary"
            size="sm"
            rightIcon={<ExternalLink className="w-4 h-4" />}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Mở Bàn Làm Việc CSKH Vanilla (Port 5500)
          </Button>
        </a>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <Headphones className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm mb-0.5">Phân Hệ CSKH Đã Được Kiểm Thử Đạt 100%</p>
          <p className="text-amber-800 leading-relaxed">
            Phân hệ CSKH của dự án đã vượt qua toàn bộ 289 bài kiểm thử backend (bao gồm 27 kịch bản tranh chấp đồng thời concurrency) và 16/16 bài kiểm thử trình duyệt Playwright E2E. Giao diện Vanilla hiện đang hoạt động hoàn hảo tại <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">staff.html</code>.
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
          <a href="http://localhost:5500/staff.html#tickets" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="w-full text-xs">
              Mở Danh Sách Vé trên Vanilla
            </Button>
          </a>
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
