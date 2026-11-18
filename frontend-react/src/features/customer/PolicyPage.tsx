import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';

export const PolicyPage: React.FC = () => {
  return (
    <div className="max-w-[1000px] mx-auto px-4 lg:px-6 py-8 pb-24 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
        <Link to="/" className="hover:text-neutral-900">Trang chủ</Link>
        <span>/</span>
        <span className="text-neutral-900 font-semibold">Chính sách đổi trả & bảo hành</span>
      </nav>

      {/* Header */}
      <div className="border-b border-neutral-200 pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase text-[#FF5C00] bg-orange-50 px-2.5 py-1 rounded">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>CHÍNH SÁCH CHÍNH HÃNG MONOLITH</span>
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-950 tracking-tight">
          Chính Sách Đổi Trả & Bảo Hành Phần Cứng
        </h1>
        <p className="text-sm text-neutral-600">
          Cam kết bảo vệ quyền lợi tối đa của khách hàng với quy trình đổi trả minh bạch trong 7 ngày.
        </p>
      </div>

      {/* Key Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
          <RotateCcw className="w-6 h-6 text-[#FF5C00]" />
          <h3 className="font-bold text-sm text-neutral-900">Đổi mới trong 7 ngày</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Áp dụng cho mọi sản phẩm phát sinh lỗi phần cứng từ phía nhà sản xuất.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
          <Clock className="w-6 h-6 text-[#FF5C00]" />
          <h3 className="font-bold text-sm text-neutral-900">Bảo hành 12 - 24 tháng</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Toàn bộ laptop, điện thoại và phụ kiện chính hãng được bảo hành theo tiêu chuẩn nhà máy.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
          <CheckCircle2 className="w-6 h-6 text-[#FF5C00]" />
          <h3 className="font-bold text-sm text-neutral-900">Thu hồi tận nơi miễn phí</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Hỗ trợ shipper đến tận địa chỉ của quý khách để nhận hàng bảo hành.
          </p>
        </div>
      </div>

      {/* Policy Details */}
      <div className="space-y-8 text-neutral-800 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-neutral-950 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5C00]" />
            1. Điều kiện áp dụng đổi trả
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-700">
            <li>Sản phẩm còn nguyên tem niêm phong của hãng và của TECHSTORE.</li>
            <li>Đầy đủ hộp, phụ kiện, sách hướng dẫn sử dụng và quà tặng kèm (nếu có).</li>
            <li>Không bị biến dạng ngoại quan, cấn móp, trầy xước, nứt vỡ hoặc vào nước do sử dụng sai hướng dẫn.</li>
            <li>Có hóa đơn mua hàng điện tử hoặc mã đơn hàng trùng khớp trên hệ thống TECHSTORE.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-neutral-950 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5C00]" />
            2. Quy trình xử lý yêu cầu đổi hàng / hoàn tiền
          </h2>
          <div className="space-y-2 text-neutral-700">
            <p>
              <strong>Bước 1:</strong> Khách hàng đăng nhập tài khoản, vào mục <em>Lịch sử đơn hàng</em> và chọn <em>Yêu cầu sau bán hàng</em> hoặc liên hệ hotline 1800-8888.
            </p>
            <p>
              <strong>Bước 2:</strong> Bộ phận kỹ thuật CSKH của TECHSTORE xác nhận thông tin và hướng dẫn gửi thiết bị qua bưu cục hoặc điều phối nhân viên đến lấy tận nhà.
            </p>
            <p>
              <strong>Bước 3:</strong> Kiểm tra thẩm định lỗi phần cứng trong vòng 24 - 48 giờ làm việc.
            </p>
            <p>
              <strong>Bước 4:</strong> Xuất thiết bị mới hoặc hoàn tiền về tài khoản ngân hàng của quý khách trong vòng 3 ngày làm việc.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-neutral-950 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5C00]" />
            3. Trường hợp từ chối bảo hành
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-700">
            <li>Sản phẩm đã bị can thiệp phần cứng, sửa chữa tại các cơ sở ngoài hệ thống ủy quyền.</li>
            <li>Thiết bị bị hư hỏng do thiên tai, hỏa hoạn, rơi rớt, sét đánh, oxy hóa linh kiện do ẩm mốc.</li>
            <li>Mất số Serial, IMEI hoặc nhãn bảo hành bị cạo sửa, tẩy xóa không thể nhận dạng.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};
