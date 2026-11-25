import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { customerService } from '../../services/customerService';
import { Modal } from '../../components/common/Modal';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import type { Order, OrderStatus } from '../../types/order';
import {
  Store,
  Star,
  Truck,
  CreditCard,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Headphones,
} from 'lucide-react';

const TABS: Array<{ id: string; label: string; status?: OrderStatus }> = [
  { id: 'all', label: 'Tất cả đơn' },
  { id: 'cho_xac_nhan', label: 'Chờ xác nhận', status: 'cho_xac_nhan' },
  { id: 'da_xac_nhan', label: 'Đang xử lý', status: 'da_xac_nhan' },
  { id: 'dang_giao', label: 'Đang giao', status: 'dang_giao' },
  { id: 'da_giao', label: 'Đã giao', status: 'da_giao' },
  { id: 'da_huy', label: 'Đã hủy', status: 'da_huy' },
];

export const OrderHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [reviewProduct, setReviewProduct] = useState<{ id: string; name: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);

  // After-sales Modal state (Đổi trả / Hoàn tiền / Hủy đơn)
  const [afterSalesOrder, setAfterSalesOrder] = useState<Order | null>(null);
  const [afterSalesType, setAfterSalesType] = useState<'huy_don' | 'hoan_tien' | 'doi_hang'>('doi_hang');
  const [afterSalesReason, setAfterSalesReason] = useState('');
  const [submittingAfterSales, setSubmittingAfterSales] = useState(false);
  const [afterSalesError, setAfterSalesError] = useState<string | null>(null);
  const [afterSalesSuccess, setAfterSalesSuccess] = useState<string | null>(null);

  // Complaint Modal state (Khiếu nại CSKH)
  const [complaintOrder, setComplaintOrder] = useState<Order | null>(null);
  const [complaintName, setComplaintName] = useState('');
  const [complaintPhone, setComplaintPhone] = useState('');
  const [complaintEmail, setComplaintEmail] = useState('');
  const [complaintReason, setComplaintReason] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [complaintError, setComplaintError] = useState<string | null>(null);
  const [complaintSuccess, setComplaintSuccess] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const selected = TABS.find((t) => t.id === activeTab);
      const params: any = { limit: 20 };
      if (selected?.status) params.status = selected.status;

      const data = await customerService.getOrders(params);
      setOrders(data.items || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async (orderId: string) => {
    const ok = window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?');
    if (!ok) return;
    try {
      await customerService.cancelOrder(orderId, 'Khách hàng hủy đơn');
      await fetchOrders();
    } catch (err: any) {
      alert(err?.message || 'Không thể hủy đơn hàng.');
    }
  };

  const handleConfirmReceived = async (orderId: string) => {
    try {
      await customerService.confirmReceived(orderId);
      await fetchOrders();
    } catch (err: any) {
      alert(err?.message || 'Không thể xác nhận nhận hàng.');
    }
  };

  const handlePayNow = async (groupCode: string) => {
    try {
      const res = await customerService.createVNPayUrl(groupCode);
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } catch (err: any) {
      alert(err?.message || 'Không thể kết nối cổng thanh toán VNPay. Vui lòng thử lại sau.');
    }
  };

  const openReviewModal = (ord: Order, item: any) => {
    setReviewOrder(ord);
    setReviewProduct({ id: item.product || '', name: item.productName });
    setRating(5);
    setReviewContent('');
    setReviewFeedback(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder || !reviewProduct) return;
    setSubmittingReview(true);
    setReviewFeedback(null);
    try {
      await customerService.createReview({
        orderId: reviewOrder._id,
        productId: reviewProduct.id,
        rating,
        content: reviewContent,
      });
      setReviewFeedback('Đánh giá sản phẩm thành công!');
      setTimeout(() => {
        setReviewOrder(null);
        setReviewProduct(null);
      }, 1500);
    } catch (err: any) {
      setReviewFeedback(err?.message || 'Không thể gửi đánh giá.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const openAfterSalesModal = (ord: Order, defaultType: 'huy_don' | 'hoan_tien' | 'doi_hang') => {
    setAfterSalesOrder(ord);
    setAfterSalesType(defaultType);
    setAfterSalesReason('');
    setAfterSalesError(null);
    setAfterSalesSuccess(null);
  };

  const handleSubmitAfterSales = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!afterSalesOrder) return;
    if (afterSalesReason.trim().length < 5) {
      setAfterSalesError('Vui lòng mô tả lý do tối thiểu 5 ký tự.');
      return;
    }
    setSubmittingAfterSales(true);
    setAfterSalesError(null);
    try {
      await customerService.requestAfterSales(afterSalesOrder._id, {
        type: afterSalesType,
        reason: afterSalesReason.trim(),
      });
      setAfterSalesSuccess('Đã gửi yêu cầu sau bán hàng thành công! Gian hàng sẽ xử lý trong vòng 24h.');
      await fetchOrders();
      setTimeout(() => {
        setAfterSalesOrder(null);
      }, 2000);
    } catch (err: any) {
      setAfterSalesError(err?.message || 'Không thể gửi yêu cầu sau bán hàng.');
    } finally {
      setSubmittingAfterSales(false);
    }
  };

  const openComplaintModal = (ord: Order) => {
    setComplaintOrder(ord);
    setComplaintName(user?.fullName || '');
    setComplaintPhone(user?.phone || '');
    setComplaintEmail(user?.email || '');
    setComplaintReason('');
    setComplaintError(null);
    setComplaintSuccess(null);
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintOrder) return;
    if (complaintReason.trim().length < 10) {
      setComplaintError('Vui lòng mô tả lý do khiếu nại tối thiểu 10 ký tự.');
      return;
    }
    setSubmittingComplaint(true);
    setComplaintError(null);
    try {
      const res = await customerService.createComplaint({
        orderCode: complaintOrder.code,
        contactName: complaintName.trim(),
        contactPhone: complaintPhone.trim(),
        contactEmail: complaintEmail.trim() || undefined,
        reason: complaintReason.trim(),
      });
      setComplaintSuccess(`Đã tạo khiếu nại thành công! Mã tiếp nhận: ${res.code}. Nhân viên CSKH sẽ phản hồi sớm.`);
      await fetchOrders();
      setTimeout(() => {
        setComplaintOrder(null);
      }, 2500);
    } catch (err: any) {
      setComplaintError(err?.message || 'Không thể gửi khiếu nại.');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const formatPrice = (val?: number) => {
    if (typeof val !== 'number') return '0 ₫';
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
          Lịch sử đơn hàng của bạn
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Theo dõi hành trình đơn hàng, xem lại lịch sử mua sắm và quản lý đánh giá sản phẩm
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-neutral-200 pb-1 text-xs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order Cards List */}
      {loading ? (
        <div className="py-16">
          <Loading message="Đang tải danh sách đơn hàng..." />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="Không tìm thấy đơn hàng nào"
          description="Hiện tại không có đơn hàng nào trong mục này."
          actionText="Khám phá sản phẩm ngay"
          onAction={() => navigate('/products')}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const shopName = typeof ord.shop === 'object' ? ord.shop.name : 'Gian hàng đối tác';

            return (
              <div
                key={ord._id}
                className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4 hover:border-neutral-300 transition"
              >
                {/* Header: Shop info + Order Code + Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 gap-2">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                      <Store className="w-4 h-4 text-[#FF5C00]" />
                      <span>{shopName}</span>
                    </div>
                    <span className="text-neutral-300">|</span>
                    <span className="font-mono text-neutral-500">Mã đơn: #{ord.code}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {new Date(ord.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-50 text-[#FF5C00] border border-orange-200 uppercase">
                      {ord.status}
                    </span>
                  </div>
                </div>

                {/* Line items list */}
                <div className="divide-y divide-neutral-100">
                  {ord.items?.map((it, i) => (
                    <div key={i} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-14 rounded-lg bg-neutral-50 border border-neutral-200 p-1 flex items-center justify-center flex-shrink-0">
                          <img
                            src={it.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80'}
                            alt={it.productName}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="truncate">
                          <h4 className="font-bold text-neutral-900 truncate leading-snug">{it.productName}</h4>
                          {it.variantName && (
                            <p className="text-[11px] text-neutral-500 font-mono mt-0.5">Phân loại: {it.variantName}</p>
                          )}
                          <span className="text-[11px] text-neutral-400 font-mono">Số lượng: x{it.quantity}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="font-bold text-sm text-[#FF5C00] font-mono">
                          {formatPrice((it.price || 0) * (it.quantity || 1))}
                        </span>

                        {(ord.status === 'da_giao' || ord.status === 'hoan_tat') && it.product && (
                          <button
                            onClick={() => openReviewModal(ord, it)}
                            className="px-2.5 py-1 rounded border border-neutral-300 hover:border-[#FF5C00] hover:text-[#FF5C00] text-[11px] font-medium transition cursor-pointer"
                          >
                            Đánh giá
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer: Grand Total & Action Buttons */}
                <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-baseline gap-2">
                    <span className="text-neutral-500">Thành tiền:</span>
                    <span className="text-lg font-black text-[#FF5C00] font-mono">
                      {formatPrice(ord.total)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {ord.payment?.method === 'online' && ord.payment?.status === 'unpaid' && ord.status === 'cho_xac_nhan' && (
                      <button
                        onClick={() => handlePayNow(ord.groupCode)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#FF5C00] hover:bg-[#E55200] text-white font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Thanh toán VNPay</span>
                      </button>
                    )}

                    {ord.status === 'cho_xac_nhan' && (
                      <button
                        onClick={() => handleCancelOrder(ord._id)}
                        className="px-3.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold transition cursor-pointer"
                      >
                        Hủy đơn
                      </button>
                    )}

                    {ord.status === 'da_giao' && (
                      <button
                        onClick={() => handleConfirmReceived(ord._id)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs cursor-pointer"
                      >
                        Đã nhận hàng
                      </button>
                    )}

                    {ord.status === 'da_xac_nhan' && (
                      <button
                        onClick={() => openAfterSalesModal(ord, 'huy_don')}
                        className="px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-semibold transition cursor-pointer"
                      >
                        Yêu cầu hủy
                      </button>
                    )}

                    {['da_giao', 'hoan_tat'].includes(ord.status) && (
                      <button
                        onClick={() => openAfterSalesModal(ord, 'doi_hang')}
                        className="px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-semibold transition cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Đổi / Trả hàng</span>
                      </button>
                    )}

                    <button
                      onClick={() => openComplaintModal(ord)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-[#FF5C00] hover:border-[#FF5C00] font-medium transition cursor-pointer flex items-center gap-1"
                      title="Gửi khiếu nại tới CSKH cho đơn hàng này"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>Khiếu nại</span>
                    </button>

                    <Link
                      to={`/orders/${ord._id}/tracking`}
                      className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold transition shadow-xs flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Theo dõi hành trình</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewOrder && reviewProduct && (
        <Modal
          isOpen={true}
          onClose={() => {
            setReviewOrder(null);
            setReviewProduct(null);
          }}
          title="Đánh giá chất lượng sản phẩm"
        >
          <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
            {reviewFeedback && (
              <div className="p-3 bg-neutral-100 text-neutral-800 rounded-lg text-xs">
                {reviewFeedback}
              </div>
            )}

            <div>
              <p className="text-neutral-600 mb-1">Sản phẩm đánh giá:</p>
              <h4 className="font-bold text-sm text-neutral-900">{reviewProduct.name}</h4>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1.5">
                Mức độ hài lòng của bạn
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-500 hover:scale-110 transition cursor-pointer"
                  >
                    <Star className={`w-6 h-6 ${star <= rating ? 'fill-current' : 'text-neutral-300'}`} />
                  </button>
                ))}
                <span className="font-bold text-neutral-800 ml-2 font-mono text-sm">
                  {rating} / 5 sao
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Nhận xét chi tiết (chất lượng phần cứng, đóng gói, tính năng)
              </label>
              <textarea
                rows={4}
                required
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="Chia sẻ trải nghiệm sử dụng thực tế của bạn với sản phẩm này..."
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-1 focus:ring-[#FF5C00] resize-none"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => {
                  setReviewOrder(null);
                  setReviewProduct(null);
                }}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2 bg-[#FF5C00] hover:bg-[#E55200] disabled:bg-neutral-300 text-white font-bold rounded-lg transition"
              >
                {submittingReview ? 'Đang gửi...' : 'Gửi nhận xét'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* After-Sales Modal */}
      {afterSalesOrder && (
        <Modal
          isOpen={true}
          onClose={() => setAfterSalesOrder(null)}
          title={`Yêu cầu sau bán hàng — Đơn ${afterSalesOrder.code}`}
        >
          <form onSubmit={handleSubmitAfterSales} className="space-y-4 text-xs">
            {afterSalesError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{afterSalesError}</span>
              </div>
            )}
            {afterSalesSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{afterSalesSuccess}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-neutral-700 mb-1.5">
                Loại yêu cầu sau bán hàng:
              </label>
              {afterSalesOrder.status === 'da_xac_nhan' ? (
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 font-medium">
                  Yêu cầu hủy đơn hàng (Đơn đã xác nhận nhưng chưa giao)
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 border rounded-xl flex items-center gap-2.5 cursor-pointer transition ${afterSalesType === 'doi_hang' ? 'border-[#FF5C00] bg-orange-50/40 text-neutral-900 font-bold' : 'border-neutral-200 text-neutral-700'}`}>
                    <input
                      type="radio"
                      name="afterSalesType"
                      value="doi_hang"
                      checked={afterSalesType === 'doi_hang'}
                      onChange={() => setAfterSalesType('doi_hang')}
                      className="accent-[#FF5C00]"
                    />
                    <span>Yêu cầu đổi hàng</span>
                  </label>
                  <label className={`p-3 border rounded-xl flex items-center gap-2.5 cursor-pointer transition ${afterSalesType === 'hoan_tien' ? 'border-[#FF5C00] bg-orange-50/40 text-neutral-900 font-bold' : 'border-neutral-200 text-neutral-700'}`}>
                    <input
                      type="radio"
                      name="afterSalesType"
                      value="hoan_tien"
                      checked={afterSalesType === 'hoan_tien'}
                      onChange={() => setAfterSalesType('hoan_tien')}
                      className="accent-[#FF5C00]"
                    />
                    <span>Trả hàng & Hoàn tiền</span>
                  </label>
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Lý do chi tiết (tối thiểu 5 ký tự) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={afterSalesReason}
                onChange={(e) => setAfterSalesReason(e.target.value)}
                placeholder="Mô tả tình trạng hàng hóa, lỗi phát sinh hoặc lý do đổi trả..."
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-1 focus:ring-[#FF5C00] resize-none"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setAfterSalesOrder(null)}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={submittingAfterSales}
                className="px-5 py-2 bg-[#FF5C00] hover:bg-[#E55200] disabled:bg-neutral-300 text-white font-bold rounded-lg transition cursor-pointer"
              >
                {submittingAfterSales ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Complaint Modal */}
      {complaintOrder && (
        <Modal
          isOpen={true}
          onClose={() => setComplaintOrder(null)}
          title={`Khiếu nại dịch vụ — Đơn ${complaintOrder.code}`}
        >
          <form onSubmit={handleSubmitComplaint} className="space-y-4 text-xs">
            {complaintError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{complaintError}</span>
              </div>
            )}
            {complaintSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{complaintSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Người liên hệ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={complaintName}
                  onChange={(e) => setComplaintName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-1 focus:ring-[#FF5C00]"
                  placeholder="Họ và tên"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={complaintPhone}
                  onChange={(e) => setComplaintPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-1 focus:ring-[#FF5C00] font-mono"
                  placeholder="Số điện thoại"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Email nhận phản hồi
              </label>
              <input
                type="email"
                value={complaintEmail}
                onChange={(e) => setComplaintEmail(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-1 focus:ring-[#FF5C00]"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Lý do và nội dung khiếu nại (tối thiểu 10 ký tự) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={complaintReason}
                onChange={(e) => setComplaintReason(e.target.value)}
                placeholder="Mô tả cụ thể sự việc (giao thiếu hàng, hàng vỡ hỏng, thái độ phục vụ...)"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-1 focus:ring-[#FF5C00] resize-none"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setComplaintOrder(null)}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={submittingComplaint}
                className="px-5 py-2 bg-[#FF5C00] hover:bg-[#E55200] disabled:bg-neutral-300 text-white font-bold rounded-lg transition cursor-pointer"
              >
                {submittingComplaint ? 'Đang gửi...' : 'Gửi khiếu nại'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
