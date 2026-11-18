import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminStaff } from '../../types/admin';

export const AdminStaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<AdminStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await adminService.getStaff();
      setStaffList(res || []);
    } catch (err: any) {
      console.error('Fetch staff error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.password) {
      alert('Vui lòng điền đầy đủ thông tin nhân viên.');
      return;
    }

    try {
      setSubmitting(true);
      await adminService.createStaff(form);
      setShowModal(false);
      setForm({ fullName: '', email: '', phone: '', password: '' });
      fetchStaff();
    } catch (err: any) {
      alert(err?.message || 'Không thể tạo tài khoản nhân viên CSKH.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLock = async (staff: AdminStaff) => {
    const isLocking = staff.status === 'active';
    const action = isLocking ? 'khóa' : 'mở khóa';
    const ok = window.confirm(`Bạn có chắc muốn ${action} tài khoản "${staff.fullName}"?`);
    if (!ok) return;

    try {
      if (isLocking) {
        await adminService.lockStaff(staff._id);
        setStaffList(staffList.map((s) => (s._id === staff._id ? { ...s, status: 'locked' } : s)));
      } else {
        await adminService.unlockStaff(staff._id);
        setStaffList(staffList.map((s) => (s._id === staff._id ? { ...s, status: 'active' } : s)));
      }
    } catch (err: any) {
      alert(err?.message || `Không thể ${action} tài khoản.`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = window.confirm(`Bạn có chắc muốn xóa tài khoản nhân viên "${name}"?`);
    if (!ok) return;

    try {
      await adminService.deleteStaff(id);
      setStaffList(staffList.filter((s) => s._id !== id));
    } catch (err: any) {
      alert(err?.message || 'Không thể xóa tài khoản nhân viên.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Nhân sự Chăm sóc Khách hàng (CSKH)</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Cấp quyền tài khoản nhân viên hỗ trợ, tiếp nhận và điều phối giải quyết khiếu nại khách hàng.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#171717] text-white text-xs font-semibold rounded hover:bg-neutral-800 transition-colors shadow-2xs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Thêm Nhân viên CSKH
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400 font-mono">Đang tải danh sách nhân viên CSKH...</div>
        ) : staffList.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">Chưa có nhân viên CSKH nào được tạo.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Nhân viên</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Vai trò</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {staffList.map((staff) => (
                  <tr key={staff._id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold font-mono text-xs">
                          {staff.fullName.charAt(0)}
                        </div>
                        <span className="font-semibold text-neutral-900">{staff.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-600">
                      {staff.email}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-500">
                      {staff.phone}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                        CSKH SÀN
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                        staff.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {staff.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleLock(staff)}
                          className={`text-[11px] font-semibold ${
                            staff.status === 'active' ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'
                          }`}
                        >
                          {staff.status === 'active' ? 'Khóa' : 'Mở khóa'}
                        </button>
                        <span className="text-neutral-200">•</span>
                        <button
                          onClick={() => handleDelete(staff._id, staff.fullName)}
                          className="text-[11px] text-red-600 hover:text-red-700 font-medium"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-neutral-200 p-6">
            <h3 className="text-base font-bold text-neutral-900 mb-1">Thêm Nhân viên CSKH</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Tạo tài khoản phụ trách phân hệ tiếp nhận khiếu nại và hỗ trợ người dùng.
            </p>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Họ và tên nhân viên*</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Email đăng nhập*</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="cskh.a@techstore.vn"
                  className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Số điện thoại liên hệ*</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0912345678"
                  className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Mật khẩu khởi tạo*</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full px-3 py-2 border border-neutral-300 rounded focus:border-[#171717] focus:ring-1 focus:ring-[#171717] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#171717] text-white font-semibold rounded hover:bg-neutral-800 disabled:opacity-50"
                >
                  {submitting ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
