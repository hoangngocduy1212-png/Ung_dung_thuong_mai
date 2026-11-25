import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { staffService, type StaffSummary, type StaffCustomer, type StaffReview } from '../../services/staffService';
import type { Complaint } from '../../types/customer';
import type { Order } from '../../types/order';
import { Modal } from '../../components/common/Modal';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Search,
  RefreshCw,
  MessageSquare,
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  ShoppingBag,
  Star,
  Trash2,
  Eye,
  Send,
  MapPin,
  Inbox,
} from 'lucide-react';

const COMPLAINT_STATUS_LABELS: Record<string, { label: string; badgeClass: string }> = {
  moi: { label: 'Chờ tiếp nhận', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  dang_xu_ly: { label: 'Đang xử lý', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  chuyen_admin: { label: 'Chuyển Admin', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
  da_xu_ly: { label: 'Đã hoàn tất', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  cho_xac_nhan: 'Chờ xác nhận',
  da_xac_nhan: 'Đã xác nhận',
  dang_giao: 'Đang giao hàng',
  da_giao: 'Đã giao hàng',
  hoan_tat: 'Hoàn tất',
  da_huy: 'Đã hủy',
  da_tra_hang: 'Đã trả hàng',
};

export const CskhDashboard: React.FC = () => {
  const { user } = useAuth();

  // Active Main Navigation Tab: 'complaints' | 'customers' | 'orders' | 'reviews'
  const [activeTab, setActiveTab] = useState<'complaints' | 'customers' | 'orders' | 'reviews'>('complaints');

  // Summary Metrics
  const [summary, setSummary] = useState<StaffSummary>({ pool: 0, mine: 0, history: 0 });
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ----------------------------------------------------
  // TAB 1: COMPLAINTS STATE
  // ----------------------------------------------------
  const [complaintScope, setComplaintScope] = useState<'pool' | 'mine' | 'history'>('pool');
  const [complaintSearch, setComplaintSearch] = useState('');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [complaintsTotal, setComplaintsTotal] = useState(0);
  const [complaintsPage, setComplaintsPage] = useState(1);
  const [complaintsLoading, setComplaintsLoading] = useState(false);

  // Complaint Detail Modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [resolveResult, setResolveResult] = useState('');
  const [escalateNote, setEscalateNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // ----------------------------------------------------
  // TAB 2: CUSTOMERS LOOKUP STATE
  // ----------------------------------------------------
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState<StaffCustomer[]>([]);
  const [customersTotal, setCustomersTotal] = useState(0);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<StaffCustomer | null>(null);

  // ----------------------------------------------------
  // TAB 3: ORDERS LOOKUP STATE
  // ----------------------------------------------------
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // ----------------------------------------------------
  // TAB 4: REVIEWS MODERATION STATE
  // ----------------------------------------------------
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState('');
  const [reviewsList, setReviewsList] = useState<StaffReview[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<StaffReview | null>(null);
  const [deletingReview, setDeletingReview] = useState(false);

  // ----------------------------------------------------
  // DATA FETCHING FUNCTIONS
  // ----------------------------------------------------

  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const data = await staffService.getSummary();
      setSummary(data);
    } catch {
      // ignore
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const fetchComplaints = useCallback(async () => {
    try {
      setComplaintsLoading(true);
      const res = await staffService.getComplaints({
        scope: complaintScope,
        q: complaintSearch.trim() || undefined,
        page: complaintsPage,
        limit: 15,
      });
      setComplaints(res.items || []);
      setComplaintsTotal(res.total || 0);
    } catch {
      setComplaints([]);
      setComplaintsTotal(0);
    } finally {
      setComplaintsLoading(false);
    }
  }, [complaintScope, complaintSearch, complaintsPage]);

  const fetchCustomers = useCallback(async () => {
    try {
      setCustomersLoading(true);
      const res = await staffService.getCustomers({
        q: customerSearch.trim() || undefined,
        limit: 15,
      });
      setCustomers(res.items || []);
      setCustomersTotal(res.total || 0);
    } catch {
      setCustomers([]);
      setCustomersTotal(0);
    } finally {
      setCustomersLoading(false);
    }
  }, [customerSearch]);

  const fetchOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const res = await staffService.getOrders({
        q: orderSearch.trim() || undefined,
        status: orderStatusFilter || undefined,
        limit: 15,
      });
      setOrdersList(res.items || []);
      setOrdersTotal(res.total || 0);
    } catch {
      setOrdersList([]);
      setOrdersTotal(0);
    } finally {
      setOrdersLoading(false);
    }
  }, [orderSearch, orderStatusFilter]);

  const fetchReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const res = await staffService.getReviews({
        q: reviewSearch.trim() || undefined,
        rating: reviewRatingFilter || undefined,
        limit: 15,
      });
      setReviewsList(res.items || []);
      setReviewsTotal(res.total || 0);
    } catch {
      setReviewsList([]);
      setReviewsTotal(0);
    } finally {
      setReviewsLoading(false);
    }
  }, [reviewSearch, reviewRatingFilter]);

  // Initial Load & Refresh
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    if (activeTab === 'complaints') fetchComplaints();
    if (activeTab === 'customers') fetchCustomers();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'reviews') fetchReviews();
  }, [activeTab, fetchComplaints, fetchCustomers, fetchOrders, fetchReviews]);

  // Open Complaint Detail
  const handleOpenComplaintDetail = async (id: string) => {
    setActionError(null);
    setReplyContent('');
    setResolveResult('');
    setEscalateNote('');
    try {
      const data = await staffService.getComplaintDetail(id);
      setSelectedComplaint(data);
    } catch (err: any) {
      showToast(err?.message || 'Không thể tải chi tiết khiếu nại.');
    }
  };

  // Complaint Actions
  const handleRespondComplaint = async () => {
    if (!selectedComplaint) return;
    if (!replyContent.trim() || replyContent.trim().length < 2) {
      setActionError('Vui lòng nhập nội dung phản hồi tối thiểu 2 ký tự.');
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await staffService.respondComplaint(selectedComplaint._id, replyContent.trim());
      setSelectedComplaint((prev) => (prev ? { ...prev, ...updated } : updated));
      setReplyContent('');
      showToast('Đã gửi phản hồi thành công và tiếp nhận phụ trách đơn khiếu nại!');
      fetchComplaints();
      fetchSummary();
    } catch (err: any) {
      setActionError(err?.message || 'Không thể gửi phản hồi.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveComplaint = async () => {
    if (!selectedComplaint) return;
    if (!resolveResult.trim() || resolveResult.trim().length < 3) {
      setActionError('Vui lòng nhập kết quả xử lý tối thiểu 3 ký tự.');
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await staffService.resolveComplaint(selectedComplaint._id, resolveResult.trim());
      setSelectedComplaint((prev) => (prev ? { ...prev, ...updated } : updated));
      setResolveResult('');
      showToast('Đã đóng khiếu nại thành công!');
      fetchComplaints();
      fetchSummary();
    } catch (err: any) {
      setActionError(err?.message || 'Không thể đóng khiếu nại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalateComplaint = async () => {
    if (!selectedComplaint) return;
    if (!escalateNote.trim() || escalateNote.trim().length < 3) {
      setActionError('Vui lòng nhập ghi chú chuyển admin tối thiểu 3 ký tự.');
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await staffService.escalateComplaint(selectedComplaint._id, escalateNote.trim());
      setSelectedComplaint((prev) => (prev ? { ...prev, ...updated } : updated));
      setEscalateNote('');
      showToast('Đã chuyển khiếu nại lên Quản trị viên thành công!');
      fetchComplaints();
      fetchSummary();
    } catch (err: any) {
      setActionError(err?.message || 'Không thể chuyển admin.');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Customer Detail
  const handleOpenCustomerDetail = async (id: string) => {
    try {
      const data = await staffService.getCustomerDetail(id);
      setSelectedCustomer(data);
    } catch (err: any) {
      showToast(err?.message || 'Không thể xem chi tiết khách hàng.');
    }
  };

  // Open Order Detail
  const handleOpenOrderDetail = async (id: string) => {
    try {
      const data = await staffService.getOrderDetail(id);
      setSelectedOrder(data);
    } catch (err: any) {
      showToast(err?.message || 'Không thể xem chi tiết đơn hàng.');
    }
  };

  // Delete Review
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;
    setDeletingReview(true);
    try {
      await staffService.deleteReview(reviewToDelete._id);
      showToast('Đã gỡ bỏ đánh giá vi phạm và tính lại điểm sản phẩm.');
      setReviewToDelete(null);
      fetchReviews();
    } catch (err: any) {
      showToast(err?.message || 'Không thể gỡ đánh giá.');
    } finally {
      setDeletingReview(false);
    }
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 pb-24 space-y-8 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold border border-neutral-700 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
              Bàn Làm Việc Chăm Sóc Khách Hàng (CSKH)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 font-mono">
              Staff Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600">
            Nhân viên hỗ trợ: <strong className="text-neutral-900">{user?.fullName || 'Chuyên viên CSKH'}</strong> ({user?.email}) • Tiếp nhận khiếu nại, hỗ trợ khách hàng và điều hòa tranh chấp.
          </p>
        </div>

        <button
          onClick={() => {
            fetchSummary();
            if (activeTab === 'complaints') fetchComplaints();
            if (activeTab === 'customers') fetchCustomers();
            if (activeTab === 'orders') fetchOrders();
            if (activeTab === 'reviews') fetchReviews();
            showToast('Đã làm mới dữ liệu mới nhất.');
          }}
          className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-neutral-200"
        >
          <RefreshCw className="w-3.5 h-3.5 text-neutral-600" />
          <span>Làm mới hệ thống</span>
        </button>
      </div>

      {/* KPI Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => {
            setActiveTab('complaints');
            setComplaintScope('pool');
          }}
          className={`p-5 rounded-2xl border text-left transition cursor-pointer shadow-xs ${
            complaintScope === 'pool' && activeTab === 'complaints'
              ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-500/30'
              : 'bg-white border-neutral-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <Inbox className="w-4 h-4 text-amber-600" />
              <span>Chờ tiếp nhận (Pool)</span>
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="text-3xl font-black text-neutral-950 font-mono">
            {summaryLoading ? '...' : summary.pool}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Khiếu nại mới của khách hàng chưa có người nhận</p>
        </button>

        <button
          onClick={() => {
            setActiveTab('complaints');
            setComplaintScope('mine');
          }}
          className={`p-5 rounded-2xl border text-left transition cursor-pointer shadow-xs ${
            complaintScope === 'mine' && activeTab === 'complaints'
              ? 'bg-blue-500/10 border-blue-400 ring-2 ring-blue-500/30'
              : 'bg-white border-neutral-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Tôi phụ trách</span>
            </span>
          </div>
          <div className="text-3xl font-black text-neutral-950 font-mono">
            {summaryLoading ? '...' : summary.mine}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Đang xử lý hoặc đã chuyển Quản trị viên</p>
        </button>

        <button
          onClick={() => {
            setActiveTab('complaints');
            setComplaintScope('history');
          }}
          className={`p-5 rounded-2xl border text-left transition cursor-pointer shadow-xs ${
            complaintScope === 'history' && activeTab === 'complaints'
              ? 'bg-emerald-500/10 border-emerald-400 ring-2 ring-emerald-500/30'
              : 'bg-white border-neutral-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Đã hoàn tất</span>
            </span>
          </div>
          <div className="text-3xl font-black text-neutral-950 font-mono">
            {summaryLoading ? '...' : summary.history}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Lịch sử khiếu nại bạn đã giải quyết xong</p>
        </button>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-200 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'complaints'
              ? 'border-[#FF5C00] text-[#FF5C00]'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Hàng đợi Khiếu nại</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'customers'
              ? 'border-[#FF5C00] text-[#FF5C00]'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Tra cứu Khách hàng</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'orders'
              ? 'border-[#FF5C00] text-[#FF5C00]'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Tra cứu Đơn hàng</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeTab === 'reviews'
              ? 'border-[#FF5C00] text-[#FF5C00]'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Kiểm duyệt Đánh giá</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: COMPLAINTS WORKSTATION                                             */}
      {/* ========================================================================= */}
      {activeTab === 'complaints' && (
        <div className="space-y-6">
          {/* Sub-scope Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-neutral-200">
            {/* Scopes */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl">
              <button
                onClick={() => {
                  setComplaintScope('pool');
                  setComplaintsPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  complaintScope === 'pool'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Chờ tiếp nhận ({summary.pool})
              </button>
              <button
                onClick={() => {
                  setComplaintScope('mine');
                  setComplaintsPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  complaintScope === 'mine'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Tôi phụ trách ({summary.mine})
              </button>
              <button
                onClick={() => {
                  setComplaintScope('history');
                  setComplaintsPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  complaintScope === 'history'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Đã giải quyết ({summary.history})
              </button>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-3 flex-1 justify-end">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={complaintSearch}
                  onChange={(e) => setComplaintSearch(e.target.value)}
                  placeholder="Tìm mã khiếu nại, mã đơn, tên, SĐT khách..."
                  className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-1 focus:ring-[#FF5C00] outline-none"
                />
              </div>
              <div className="text-xs text-neutral-500 whitespace-nowrap hidden sm:block">
                Tổng: <strong className="text-neutral-900 font-mono">{complaintsTotal}</strong>
              </div>
            </div>
          </div>

          {/* Complaints Table */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            {complaintsLoading ? (
              <div className="py-16 flex justify-center">
                <Loading size="lg" message="Đang tải danh sách khiếu nại..." />
              </div>
            ) : complaints.length === 0 ? (
              <div className="py-16">
                <EmptyState
                  title={complaintScope === 'pool' ? 'Không có khiếu nại mới' : 'Danh sách trống'}
                  description="Hiện tại không có vé khiếu nại nào phù hợp với bộ lọc tìm kiếm này."
                  icon={<Inbox className="w-7 h-7" />}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-600 font-semibold uppercase tracking-wider text-[11px] border-b border-neutral-200">
                    <tr>
                      <th className="py-3.5 px-4">Mã khiếu nại</th>
                      <th className="py-3.5 px-4">Đơn hàng</th>
                      <th className="py-3.5 px-4">Khách hàng</th>
                      <th className="py-3.5 px-4">Nội dung khiếu nại</th>
                      <th className="py-3.5 px-4">Trạng thái</th>
                      <th className="py-3.5 px-4">Thời gian</th>
                      <th className="py-3.5 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {complaints.map((c) => {
                      const st = COMPLAINT_STATUS_LABELS[c.status] || {
                        label: c.status,
                        badgeClass: 'bg-neutral-100 text-neutral-700',
                      };
                      return (
                        <tr key={c._id} className="hover:bg-neutral-50/70 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                            {c.code}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-[#FF5C00]">
                            {c.orderCode}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-neutral-900">{c.contactName}</div>
                            <div className="text-[11px] text-neutral-500 font-mono">{c.contactPhone}</div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs truncate text-neutral-700">
                            {c.reason}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${st.badgeClass}`}>
                              {st.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px]">
                            {formatDate(c.createdAt)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleOpenComplaintDetail(c._id)}
                              className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Chi tiết</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CUSTOMERS LOOKUP                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Tra cứu tên khách hàng, email hoặc số điện thoại..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-1 focus:ring-[#FF5C00] outline-none"
              />
            </div>
            <div className="text-xs text-neutral-500">
              Tổng số khách hàng tìm thấy: <strong className="text-neutral-900 font-mono">{customersTotal}</strong>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            {customersLoading ? (
              <div className="py-16 flex justify-center">
                <Loading size="lg" message="Đang tra cứu dữ liệu khách hàng..." />
              </div>
            ) : customers.length === 0 ? (
              <div className="py-16">
                <EmptyState
                  title="Không tìm thấy khách hàng"
                  description="Hãy thử tìm kiếm bằng từ khóa khác hoặc xóa bộ lọc."
                  icon={<User className="w-7 h-7" />}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-600 font-semibold uppercase tracking-wider text-[11px] border-b border-neutral-200">
                    <tr>
                      <th className="py-3.5 px-4">Họ và tên</th>
                      <th className="py-3.5 px-4">Số điện thoại</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Điểm tích lũy</th>
                      <th className="py-3.5 px-4">Trạng thái</th>
                      <th className="py-3.5 px-4">Ngày đăng ký</th>
                      <th className="py-3.5 px-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {customers.map((cust) => (
                      <tr key={cust._id} className="hover:bg-neutral-50/70 transition">
                        <td className="py-3.5 px-4 font-bold text-neutral-900">{cust.fullName}</td>
                        <td className="py-3.5 px-4 font-mono text-neutral-700">{cust.phone || '—'}</td>
                        <td className="py-3.5 px-4 text-neutral-600 font-mono text-[11px]">{cust.email}</td>
                        <td className="py-3.5 px-4 font-bold font-mono text-[#FF5C00]">{cust.points || 0} pts</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${cust.status === 'locked' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {cust.status === 'locked' ? 'Đã khóa' : 'Hoạt động'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px]">{formatDate(cust.createdAt)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenCustomerDetail(cust._id)}
                            className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:border-neutral-900 text-neutral-800 font-semibold text-xs transition cursor-pointer"
                          >
                            Hồ sơ & Đơn hàng
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ORDERS LOOKUP                                                      */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Tra cứu mã đơn, mã nhóm, tên khách, SĐT..."
                  className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-1 focus:ring-[#FF5C00] outline-none font-mono"
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-[#FF5C00]"
              >
                <option value="">Tất cả trạng thái</option>
                {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-neutral-500">
              Tổng số đơn: <strong className="text-neutral-900 font-mono">{ordersTotal}</strong>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            {ordersLoading ? (
              <div className="py-16 flex justify-center">
                <Loading size="lg" message="Đang tra cứu đơn hàng..." />
              </div>
            ) : ordersList.length === 0 ? (
              <div className="py-16">
                <EmptyState
                  title="Không tìm thấy đơn hàng"
                  description="Hãy thử nhập mã đơn hàng đầy đủ hoặc thay đổi trạng thái lọc."
                  icon={<ShoppingBag className="w-7 h-7" />}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-600 font-semibold uppercase tracking-wider text-[11px] border-b border-neutral-200">
                    <tr>
                      <th className="py-3.5 px-4">Mã đơn</th>
                      <th className="py-3.5 px-4">Gian hàng</th>
                      <th className="py-3.5 px-4">Khách hàng</th>
                      <th className="py-3.5 px-4">Tổng tiền</th>
                      <th className="py-3.5 px-4">Thanh toán</th>
                      <th className="py-3.5 px-4">Trạng thái</th>
                      <th className="py-3.5 px-4">Ngày tạo</th>
                      <th className="py-3.5 px-4 text-right">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {ordersList.map((ord) => (
                      <tr key={ord._id} className="hover:bg-neutral-50/70 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">{ord.code}</td>
                        <td className="py-3.5 px-4 font-medium text-neutral-700">
                          {typeof ord.shop === 'object' ? ord.shop.name : 'Gian hàng'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-neutral-900">
                            {typeof ord.customer === 'object' ? ord.customer.fullName : 'Khách hàng'}
                          </div>
                          <div className="text-[11px] text-neutral-500 font-mono">
                            {typeof ord.customer === 'object' ? ord.customer.phone : ''}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#FF5C00]">
                          {formatPrice(ord.total)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <span className={`px-2 py-0.5 rounded-full font-bold ${ord.payment?.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-600'}`}>
                            {ord.payment?.method?.toUpperCase()} • {ord.payment?.status === 'paid' ? 'Đã thanh toán' : 'Chưa TT'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-neutral-800">
                          {ORDER_STATUS_LABELS[ord.status] || ord.status}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px]">
                          {formatDate(ord.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenOrderDetail(ord._id)}
                            className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs transition cursor-pointer shadow-xs inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: REVIEWS MODERATION                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  placeholder="Lọc đánh giá theo tên sản phẩm..."
                  className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-1 focus:ring-[#FF5C00] outline-none"
                />
              </div>

              <select
                value={reviewRatingFilter}
                onChange={(e) => setReviewRatingFilter(e.target.value)}
                className="px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-[#FF5C00]"
              >
                <option value="">Tất cả số sao</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>
            </div>

            <div className="text-xs text-neutral-500">
              Tổng đánh giá: <strong className="text-neutral-900 font-mono">{reviewsTotal}</strong>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            {reviewsLoading ? (
              <div className="py-16 flex justify-center">
                <Loading size="lg" message="Đang tải danh sách đánh giá..." />
              </div>
            ) : reviewsList.length === 0 ? (
              <div className="py-16">
                <EmptyState
                  title="Không có đánh giá nào"
                  description="Không tìm thấy đánh giá sản phẩm nào thỏa mãn điều kiện lọc."
                  icon={<Star className="w-7 h-7" />}
                />
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {reviewsList.map((rv) => (
                  <div key={rv._id} className="p-5 hover:bg-neutral-50/70 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-neutral-950">{rv.product?.name || 'Sản phẩm'}</span>
                        <span className="text-xs text-neutral-500 font-mono">Gian hàng: {rv.shop?.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= rv.rating ? 'fill-current' : 'text-neutral-200'}`} />
                          ))}
                        </div>
                        <span className="text-xs font-bold font-mono text-neutral-700">{rv.rating}/5 sao</span>
                        <span className="text-neutral-300">•</span>
                        <span className="text-xs font-semibold text-neutral-700">{rv.customer?.fullName}</span>
                        <span className="text-neutral-300">•</span>
                        <span className="text-[11px] text-neutral-400 font-mono">{formatDate(rv.createdAt)}</span>
                      </div>

                      <p className="text-xs text-neutral-800 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                        "{rv.content || '(Không có nội dung văn bản)'}"
                      </p>

                      {rv.reply && (
                        <div className="text-xs bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60 text-amber-900 ml-4">
                          <strong>Phản hồi của gian hàng:</strong> {rv.reply.content}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setReviewToDelete(rv)}
                      className="px-3.5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-end md:self-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Gỡ đánh giá</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: COMPLAINT DETAIL & ACTION WORKSTATION                              */}
      {/* ========================================================================= */}
      {selectedComplaint && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedComplaint(null)}
          title={`Hồ sơ Khiếu nại #${selectedComplaint.code}`}
        >
          <div className="space-y-6 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* Status & Meta Header */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs text-neutral-500">Trạng thái hồ sơ:</div>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${COMPLAINT_STATUS_LABELS[selectedComplaint.status]?.badgeClass}`}>
                    {COMPLAINT_STATUS_LABELS[selectedComplaint.status]?.label || selectedComplaint.status}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs text-neutral-500">Mã đơn hàng liên kết:</div>
                <div className="font-mono font-bold text-sm text-[#FF5C00] mt-0.5">
                  {selectedComplaint.orderCode}
                </div>
              </div>

              <div>
                <div className="text-xs text-neutral-500">Ngày tạo:</div>
                <div className="font-mono text-neutral-700 mt-0.5">
                  {formatDate(selectedComplaint.createdAt)}
                </div>
              </div>
            </div>

            {/* Customer & Order Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-neutral-200 space-y-2">
                <div className="font-bold text-neutral-900 border-b border-neutral-100 pb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Thông tin khách hàng khiếu nại</span>
                </div>
                <div><strong>Họ và tên:</strong> {selectedComplaint.contactName}</div>
                <div><strong>Số điện thoại:</strong> <span className="font-mono">{selectedComplaint.contactPhone}</span></div>
                <div><strong>Email:</strong> <span className="font-mono">{selectedComplaint.contactEmail || '—'}</span></div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 space-y-2">
                <div className="font-bold text-neutral-900 border-b border-neutral-100 pb-1.5 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Thông tin đơn hàng liên kết</span>
                </div>
                {selectedComplaint.orderDetail ? (
                  <>
                    <div><strong>Gian hàng:</strong> {selectedComplaint.orderDetail.shop?.name || 'Gian hàng'}</div>
                    <div><strong>Tổng tiền đơn:</strong> <span className="font-mono font-bold text-[#FF5C00]">{formatPrice(selectedComplaint.orderDetail.total)}</span></div>
                    <div><strong>Trạng thái giao hàng:</strong> {ORDER_STATUS_LABELS[selectedComplaint.orderDetail.status] || selectedComplaint.orderDetail.status}</div>
                  </>
                ) : (
                  <div className="text-neutral-500">Mã đơn: {selectedComplaint.orderCode}</div>
                )}
              </div>
            </div>

            {/* Complaint Reason */}
            <div className="space-y-1.5">
              <div className="font-bold text-neutral-900">Lý do khiếu nại của khách hàng:</div>
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-900 leading-relaxed whitespace-pre-wrap">
                {selectedComplaint.reason}
              </div>
            </div>

            {/* Final Result / Admin Escalation Status */}
            {selectedComplaint.status === 'chuyen_admin' && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  <span>Hồ sơ đã được chuyển lên Quản trị viên (Admin)</span>
                </div>
                <div>Ghi chú chuyển tiếp: <em>"{selectedComplaint.escalateNote || 'Không có ghi chú'}"</em></div>
                <div className="text-[11px] font-mono text-purple-700">Chuyển lúc: {formatDate(selectedComplaint.escalatedAt)}</div>
              </div>
            )}

            {selectedComplaint.status === 'da_xu_ly' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-sm text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Khiếu nại đã được giải quyết hoàn tất</span>
                </div>
                <div className="text-xs">Kết quả kết luận: <strong>{selectedComplaint.result}</strong></div>
                <div className="text-[11px] font-mono text-emerald-700">Hoàn tất lúc: {formatDate(selectedComplaint.resolvedAt)}</div>
              </div>
            )}

            {/* Response Timeline */}
            <div className="space-y-3">
              <div className="font-bold text-neutral-900 border-b border-neutral-100 pb-2 flex items-center justify-between">
                <span>Nhật ký trao đổi & Phản hồi ({selectedComplaint.responses?.length || 0})</span>
              </div>

              {selectedComplaint.responses && selectedComplaint.responses.length > 0 ? (
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {selectedComplaint.responses.map((r, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        r.role === 'customer'
                          ? 'bg-blue-50/60 border-blue-200/60 text-blue-950'
                          : r.role === 'admin'
                          ? 'bg-purple-50/60 border-purple-200/60 text-purple-950'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                        <span className="font-bold text-neutral-800">
                          {r.role === 'customer' ? 'Khách hàng' : r.role === 'admin' ? 'Quản trị viên (Admin)' : 'Nhân viên CSKH'}: {r.by?.fullName || ''}
                        </span>
                        <span>{formatDate(r.at)}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{r.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-neutral-400 italic py-2">Chưa có phản hồi nào được ghi nhận.</div>
              )}
            </div>

            {/* Action Section (Active if status in 'moi' or 'dang_xu_ly') */}
            {['moi', 'dang_xu_ly'].includes(selectedComplaint.status) && (
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4">
                <div className="font-bold text-sm text-neutral-950">Thao tác xử lý hồ sơ khiếu nại</div>

                {actionError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{actionError}</span>
                  </div>
                )}

                {/* 1. Gửi phản hồi khách */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-neutral-700">
                    Phản hồi khách hàng (nhận quyền phụ trách đơn nếu là lần đầu):
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Nhập nội dung trao đổi, trấn an hoặc hướng dẫn khách hàng..."
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded-xl outline-none focus:ring-1 focus:ring-[#FF5C00] resize-none"
                    />
                    <button
                      onClick={handleRespondComplaint}
                      disabled={actionLoading || !replyContent.trim()}
                      className="px-4 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Gửi</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-neutral-200">
                  {/* 2. Đóng khiếu nại */}
                  <div className="space-y-2">
                    <label className="block font-semibold text-emerald-800">
                      Giải quyết hoàn tất khiếu nại:
                    </label>
                    <input
                      type="text"
                      value={resolveResult}
                      onChange={(e) => setResolveResult(e.target.value)}
                      placeholder="Kết quả giải quyết (ví dụ: Đã gửi bù quà tặng)..."
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      onClick={handleResolveComplaint}
                      disabled={actionLoading || !resolveResult.trim()}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white font-bold rounded-xl transition cursor-pointer"
                    >
                      Đóng khiếu nại (Hoàn tất)
                    </button>
                  </div>

                  {/* 3. Chuyển Admin */}
                  <div className="space-y-2">
                    <label className="block font-semibold text-purple-800">
                      Chuyển lên Quản trị viên (khi cần phân xử/hoàn tiền):
                    </label>
                    <input
                      type="text"
                      value={escalateNote}
                      onChange={(e) => setEscalateNote(e.target.value)}
                      placeholder="Lý do chuyển admin (ví dụ: Khách yêu cầu hoàn tiền)..."
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      onClick={handleEscalateComplaint}
                      disabled={actionLoading || !escalateNote.trim()}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-300 text-white font-bold rounded-xl transition cursor-pointer"
                    >
                      Chuyển Admin phân xử
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CUSTOMER PROFILE & ORDERS DETAIL                                   */}
      {/* ========================================================================= */}
      {selectedCustomer && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCustomer(null)}
          title={`Hồ sơ Khách hàng — ${selectedCustomer.fullName}`}
        >
          <div className="space-y-6 text-xs max-h-[75vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <div>
                <span className="text-neutral-500">Số điện thoại:</span>
                <div className="font-mono font-bold text-neutral-900 mt-0.5">{selectedCustomer.phone || '—'}</div>
              </div>
              <div>
                <span className="text-neutral-500">Email:</span>
                <div className="font-mono font-bold text-neutral-900 mt-0.5">{selectedCustomer.email}</div>
              </div>
              <div>
                <span className="text-neutral-500">Điểm thưởng:</span>
                <div className="font-mono font-bold text-[#FF5C00] mt-0.5">{selectedCustomer.points || 0} pts</div>
              </div>
              <div>
                <span className="text-neutral-500">Ngày tham gia:</span>
                <div className="font-mono text-neutral-700 mt-0.5">{formatDate(selectedCustomer.createdAt)}</div>
              </div>
            </div>

            {/* Address Book */}
            <div className="space-y-2">
              <h4 className="font-bold text-neutral-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                <span>Sổ địa chỉ ({selectedCustomer.addresses?.length || 0})</span>
              </h4>
              {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedCustomer.addresses.map((a, idx) => (
                    <div key={idx} className="p-3 bg-white border border-neutral-200 rounded-xl space-y-1">
                      <div className="font-bold text-neutral-900 flex items-center justify-between">
                        <span>{a.receiver}</span>
                        {a.isDefault && <span className="text-[10px] bg-neutral-900 text-white px-2 py-0.5 rounded font-mono">Mặc định</span>}
                      </div>
                      <div className="text-neutral-600 font-mono text-[11px]">{a.phone}</div>
                      <div className="text-neutral-700">{a.detail}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-neutral-400 italic">Khách hàng chưa lưu địa chỉ nào.</div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="space-y-2">
              <h4 className="font-bold text-neutral-900 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-neutral-500" />
                <span>Đơn hàng gần đây ({selectedCustomer.recentOrders?.length || 0})</span>
              </h4>
              {selectedCustomer.recentOrders && selectedCustomer.recentOrders.length > 0 ? (
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 text-neutral-600 font-semibold text-[11px]">
                      <tr>
                        <th className="p-2.5">Mã đơn</th>
                        <th className="p-2.5">Gian hàng</th>
                        <th className="p-2.5">Tổng tiền</th>
                        <th className="p-2.5">Trạng thái</th>
                        <th className="p-2.5">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {selectedCustomer.recentOrders.map((ro) => (
                        <tr key={ro._id} className="hover:bg-neutral-50">
                          <td className="p-2.5 font-mono font-bold text-[#FF5C00]">{ro.code}</td>
                          <td className="p-2.5">{ro.shop?.name || 'Gian hàng'}</td>
                          <td className="p-2.5 font-mono font-semibold">{formatPrice(ro.total)}</td>
                          <td className="p-2.5 font-semibold text-neutral-700">{ORDER_STATUS_LABELS[ro.status] || ro.status}</td>
                          <td className="p-2.5 font-mono text-[11px] text-neutral-500">{formatDate(ro.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-neutral-400 italic">Khách hàng chưa có đơn hàng nào.</div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ORDER DETAILS & LINKED AFTER-SALES / COMPLAINTS                     */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          title={`Chi tiết Đơn hàng — ${selectedOrder.code}`}
        >
          <div className="space-y-6 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* Order Overview Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <div>
                <span className="text-neutral-500">Mã nhóm:</span>
                <div className="font-mono font-bold text-neutral-900 mt-0.5">{selectedOrder.groupCode}</div>
              </div>
              <div>
                <span className="text-neutral-500">Trạng thái đơn:</span>
                <div className="font-bold text-[#FF5C00] mt-0.5">{ORDER_STATUS_LABELS[selectedOrder.status] || selectedOrder.status}</div>
              </div>
              <div>
                <span className="text-neutral-500">Thanh toán:</span>
                <div className="font-mono text-neutral-900 mt-0.5 font-bold">
                  {selectedOrder.payment?.method?.toUpperCase()} • {selectedOrder.payment?.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </div>
              </div>
              <div>
                <span className="text-neutral-500">Tổng tiền:</span>
                <div className="font-mono font-black text-sm text-[#FF5C00] mt-0.5">{formatPrice(selectedOrder.total)}</div>
              </div>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-neutral-200 space-y-1.5">
                <div className="font-bold text-neutral-900 border-b border-neutral-100 pb-1">Khách hàng đặt</div>
                <div>{selectedOrder.customer?.fullName}</div>
                <div className="font-mono text-neutral-600">{selectedOrder.customer?.phone}</div>
                <div className="font-mono text-neutral-600">{selectedOrder.customer?.email}</div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 space-y-1.5">
                <div className="font-bold text-neutral-900 border-b border-neutral-100 pb-1">Địa chỉ nhận hàng</div>
                <div>{selectedOrder.shippingAddress?.fullName || selectedOrder.shippingAddress?.receiver}</div>
                <div className="font-mono text-neutral-600">{selectedOrder.shippingAddress?.phone}</div>
                <div className="text-neutral-700">{selectedOrder.shippingAddress?.detail}</div>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              <h4 className="font-bold text-neutral-900">Danh sách sản phẩm trong đơn</h4>
              <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-100">
                {selectedOrder.items?.map((it: any, idx: number) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {it.image && (
                        <img src={it.image} alt={it.productName || it.name} className="w-10 h-10 object-cover rounded-lg border border-neutral-200" />
                      )}
                      <div>
                        <div className="font-semibold text-neutral-900">{it.productName || it.name}</div>
                        {it.variantName && <div className="text-neutral-500 text-[11px] font-mono">{it.variantName}</div>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-neutral-900">{formatPrice(it.price)} x {it.quantity}</div>
                      <div className="font-mono text-[#FF5C00] font-bold text-[11px]">{formatPrice(it.price * it.quantity)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Linked After-Sales & Complaints */}
            {selectedOrder.afterSales && selectedOrder.afterSales.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900">Yêu cầu sau bán hàng (Đổi trả / Hoàn tiền)</h4>
                <div className="space-y-2">
                  {selectedOrder.afterSales.map((as: any, idx: number) => (
                    <div key={idx} className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-amber-900 uppercase font-mono">{as.type}</span>
                        <span className="text-[11px]">{as.status}</span>
                      </div>
                      <div className="text-neutral-700">Lý do: {as.reason}</div>
                      {as.sellerNote && <div className="text-neutral-600">Phản hồi của gian hàng: {as.sellerNote}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE REVIEW CONFIRMATION                                         */}
      {/* ========================================================================= */}
      {reviewToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setReviewToDelete(null)}
          title="Xác nhận gỡ đánh giá vi phạm"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl space-y-1">
              <div className="font-bold text-sm">Hành động gỡ bỏ đánh giá</div>
              <p>
                Đánh giá này sẽ được đánh dấu xóa mềm, không còn hiển thị công khai trên gian hàng. Hệ thống sẽ tự động tính lại điểm trung bình sao của sản phẩm.
              </p>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <div><strong>Sản phẩm:</strong> {reviewToDelete.product?.name}</div>
              <div><strong>Khách hàng:</strong> {reviewToDelete.customer?.fullName}</div>
              <div><strong>Nội dung:</strong> "{reviewToDelete.content}"</div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteReview}
                disabled={deletingReview}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-neutral-300 text-white font-bold rounded-lg transition cursor-pointer"
              >
                {deletingReview ? 'Đang gỡ...' : 'Xác nhận gỡ đánh giá'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
