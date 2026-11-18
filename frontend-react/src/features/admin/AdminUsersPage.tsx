import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminCustomer } from '../../types/admin';

export const AdminUsersPage: React.FC = () => {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { page, limit: 15 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery.trim()) params.q = searchQuery.trim();

      const res = await adminService.getCustomers(params);
      setCustomers(res.items || []);
      setTotalUsers(res.total || 0);
      setTotalPages(Math.ceil((res.total || 0) / 15) || 1);
    } catch (err: any) {
      console.error('Fetch admin customers error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleToggleLock = async (customer: AdminCustomer) => {
    const isLocking = customer.status === 'active';
    const actionText = isLocking ? 'khóa' : 'mở khóa';
    const ok = window.confirm(`Bạn có chắc muốn ${actionText} tài khoản khách hàng "${customer.fullName}" không?`);
    if (!ok) return;

    try {
      setSubmitting(true);
      if (isLocking) {
        await adminService.lockCustomer(customer._id);
        setCustomers(customers.map((c) => (c._id === customer._id ? { ...c, status: 'locked' } : c)));
      } else {
        await adminService.unlockCustomer(customer._id);
        setCustomers(customers.map((c) => (c._id === customer._id ? { ...c, status: 'active' } : c)));
      }
    } catch (err: any) {
      alert(err?.message || `Không thể ${actionText} tài khoản.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Quản lý Khách hàng</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Danh bạ người dùng, điểm tích lũy và kiểm soát trạng thái hoạt động ({totalUsers} khách hàng).
          </p>
        </div>
        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded hover:bg-neutral-50"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-neutral-200 text-xs font-medium">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'active', label: 'Đang hoạt động' },
          { key: 'locked', label: 'Đã khóa' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatusFilter(tab.key);
              setPage(1);
            }}
            className={`px-3.5 py-2.5 rounded-t transition-colors whitespace-nowrap border-b-2 font-mono ${
              statusFilter === tab.key
                ? 'border-[#171717] text-neutral-900 font-bold bg-neutral-100/50'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-md">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo họ tên, email, SĐT..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none"
          />
          <svg className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-neutral-900 text-white rounded text-xs font-semibold hover:bg-neutral-800 transition-colors"
        >
          Tìm kiếm
        </button>
      </form>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400 font-mono">Đang tải danh sách khách hàng...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">Không tìm thấy khách hàng nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4 text-right">Điểm thưởng</th>
                  <th className="py-3 px-4">Ngày đăng ký</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-xs text-neutral-700 font-mono shrink-0">
                          {c.fullName?.charAt(0) || 'U'}
                        </div>
                        <span className="font-semibold text-neutral-900">{c.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-600">
                      {c.email}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-500">
                      {c.phone || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#FF5C00]">
                      {c.points?.toLocaleString('vi-VN') || 0} pts
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-400 text-[11px] whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                        c.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {c.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleLock(c)}
                        disabled={submitting}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition-colors ${
                          c.status === 'active'
                            ? 'text-red-600 border-red-200 hover:bg-red-50'
                            : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        {c.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 border-t border-neutral-200 text-xs">
            <span className="text-neutral-500 font-mono">
              Trang {page} / {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="px-2.5 py-1 bg-white border border-neutral-300 rounded disabled:opacity-40"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="px-2.5 py-1 bg-white border border-neutral-300 rounded disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
