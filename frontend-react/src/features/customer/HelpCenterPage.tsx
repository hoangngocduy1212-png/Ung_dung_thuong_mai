import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, HelpCircle, ChevronDown, ChevronUp, MessageSquare, Phone, Mail } from 'lucide-react';

const FAQS = [
  {
    q: 'Làm thế nào để tra cứu tình trạng đơn hàng của tôi?',
    a: 'Bạn có thể đăng nhập tài khoản TECHSTORE, vào mục "Tài khoản" -> "Lịch sử đơn hàng" hoặc sử dụng trang "Theo dõi đơn hàng" với mã đơn hàng đã được gửi qua email.',
  },
  {
    q: 'Thời gian giao hàng tiêu chuẩn là bao lâu?',
    a: 'Đối với các thành phố lớn như Hà Nội và TP. Hồ Chí Minh, đơn hàng giao trong vòng 24 - 48 giờ. Đối với các tỉnh thành khác, thời gian giao từ 2 - 4 ngày làm việc.',
  },
  {
    q: 'Tôi có thể kiểm tra hàng trước khi thanh toán không?',
    a: 'Có. Tất cả đơn hàng COD tại TECHSTORE đều được phép đồng kiểm ngoại quan cùng nhân viên giao hàng trước khi thanh toán.',
  },
  {
    q: 'Chính sách đổi trả sản phẩm khi có lỗi phần cứng?',
    a: 'TECHSTORE hỗ trợ 1 đổi 1 trong vòng 7 ngày đầu tiên nếu máy có lỗi từ nhà sản xuất. Sản phẩm cần giữ đầy đủ hộp và phụ kiện.',
  },
  {
    q: 'Làm cách nào để sử dụng mã giảm giá (Voucher)?',
    a: 'Tại bước giỏ hàng hoặc trang Thanh toán, bạn chỉ cần chọn hoặc nhập mã Voucher hợp lệ vào ô "Mã giảm giá" và nhấn Áp dụng để được trừ tiền trực tiếp.',
  },
];

export const HelpCenterPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [search, setSearch] = useState('');

  const filteredFaqs = FAQS.filter(
    (f) => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1000px] mx-auto px-4 lg:px-6 py-8 pb-24 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
        <Link to="/" className="hover:text-neutral-900">Trang chủ</Link>
        <span>/</span>
        <span className="text-neutral-900 font-semibold">Trung tâm trợ giúp</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-neutral-900 text-white rounded-2xl p-8 md:p-12 text-center space-y-4">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase text-[#FF5C00] bg-white/10 px-3 py-1 rounded-full">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>HỖ TRỢ KHÁCH HÀNG 24/7</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Chúng tôi có thể giúp gì cho bạn?
        </h1>
        <p className="text-neutral-400 text-xs sm:text-sm max-w-lg mx-auto">
          Tìm kiếm câu trả lời nhanh cho các câu hỏi thường gặp về đơn hàng, chính sách và dịch vụ.
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto relative pt-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm vấn đề (đổi trả, bảo hành, thanh toán...)"
            className="w-full pl-11 pr-4 py-3 bg-white text-neutral-900 rounded-xl text-xs sm:text-sm outline-none border border-neutral-300 focus:ring-2 focus:ring-[#FF5C00]"
          />
        </div>
      </div>

      {/* Contact Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-[#FF5C00]">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-neutral-500">Tổng đài miễn phí</div>
            <div className="font-bold text-sm text-neutral-900 font-mono">1800-8888</div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-[#FF5C00]">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-neutral-500">Hỗ trợ kỹ thuật</div>
            <div className="font-bold text-xs text-neutral-900 font-mono">support@techstore.vn</div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-[#FF5C00]">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-neutral-500">Gửi khiếu nại CSKH</div>
            <Link to="/contact" className="font-bold text-xs text-[#FF5C00] hover:underline">
              Gửi biểu mẫu trực tuyến
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-950">Câu hỏi thường gặp</h2>
        <div className="space-y-3">
          {filteredFaqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="border border-neutral-200 rounded-xl overflow-hidden bg-white transition-shadow hover:shadow-xs"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-neutral-900 hover:text-[#FF5C00] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#FF5C00]" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
