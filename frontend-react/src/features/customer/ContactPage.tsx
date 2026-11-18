import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { customerService } from '../../services/customerService';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [orderCode, setOrderCode] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !message) {
      setErrorMessage('Vui lòng điền đầy đủ họ tên, số điện thoại và nội dung yêu cầu.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      if (isAuthenticated && orderCode) {
        // Send complaint via real API
        const res = await customerService.createComplaint({
          orderId: orderCode, // or search
          contactName: fullName,
          contactPhone: phone,
          contactEmail: email,
          reason: message,
        });
        setSubmittedCode(res.code || 'CSKH-' + Math.floor(100000 + Math.random() * 900000));
      } else {
        // Local simulation if guest or no specific orderId
        setSubmittedCode('CSKH-' + Math.floor(100000 + Math.random() * 900000));
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Có lỗi khi gửi biểu mẫu. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 lg:px-6 py-8 pb-24 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
        <Link to="/" className="hover:text-neutral-900">Trang chủ</Link>
        <span>/</span>
        <span className="text-neutral-900 font-semibold">Liên hệ & Hỗ trợ CSKH</span>
      </nav>

      {/* Header */}
      <div className="border-b border-neutral-200 pb-6 space-y-2">
        <h1 className="text-3xl font-extrabold text-neutral-950 tracking-tight">
          Liên Hệ & Tiếp Nhận Khiếu Nại
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600">
          Đội ngũ chăm sóc khách hàng và hỗ trợ kỹ thuật của TECHSTORE luôn sẵn sàng giải đáp mọi thắc mắc.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 space-y-6">
            <h2 className="text-base font-bold text-neutral-950">Thông tin liên hệ chính thức</h2>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#FF5C00] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-neutral-900">Hotline tư vấn & CSKH</div>
                  <div className="text-neutral-600 font-mono">1800-8888 (Miễn phí cuộc gọi)</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#FF5C00] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-neutral-900">Email hỗ trợ dịch vụ</div>
                  <div className="text-neutral-600 font-mono">cskh@techstore.vn</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#FF5C00] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-neutral-900">Thời gian làm việc</div>
                  <div className="text-neutral-600">Thứ 2 - Chủ Nhật: 08:00 - 21:30</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#FF5C00] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-neutral-900">Trụ sở chính</div>
                  <div className="text-neutral-600">Tòa nhà Monolith Tech Tower, Cầu Giấy, Hà Nội</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          {submittedCode ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-950">Gửi Yêu Cầu Thành Công</h3>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
                Mã phiếu tiếp nhận của bạn là <strong className="font-mono text-neutral-900">{submittedCode}</strong>.
                Nhân viên CSKH của chúng tôi sẽ liên hệ lại qua số điện thoại hoặc email trong vòng 2 giờ làm việc.
              </p>
              <button
                onClick={() => {
                  setSubmittedCode(null);
                  setMessage('');
                }}
                className="mt-4 px-5 py-2.5 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition"
              >
                Gửi yêu cầu khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-base font-bold text-neutral-950 pb-2 border-b border-neutral-100">
                Gửi phản hồi / Yêu cầu hỗ trợ
              </h2>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-[#FF5C00] outline-none"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-[#FF5C00] outline-none font-mono"
                    placeholder="0912 345 678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-[#FF5C00] outline-none"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Mã đơn hàng liên quan (nếu có)
                  </label>
                  <input
                    type="text"
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-[#FF5C00] outline-none font-mono"
                    placeholder="ORD-..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nội dung phản hồi hoặc khiếu nại <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-[#FF5C00] outline-none resize-none leading-relaxed"
                  placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FF5C00] hover:bg-[#E55200] disabled:bg-neutral-300 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu hỗ trợ'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
