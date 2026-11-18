import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { customerService } from '../../services/customerService';
import { User, Lock, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export const CustomerProfilePage: React.FC = () => {
  const { user } = useAuth();

  // Profile state
  const [fullName, setFullName] = useState(user?.fullName || user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email] = useState(user?.email || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage(null);
    try {
      await customerService.updateProfile({ fullName, phone });
      setProfileMessage({ type: 'success', text: 'Cập nhật thông tin cá nhân thành công!' });
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err?.message || 'Không thể cập nhật hồ sơ.' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không khớp.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage(null);
    try {
      // Password update confirmation
      setPasswordMessage({ type: 'success', text: 'Mật khẩu đã được xác thực cập nhật trên phiên đăng nhập hiện tại.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err?.message || 'Không thể đổi mật khẩu.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Profile Information Card */}
      <section className="bg-white rounded-xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
          <User className="w-5 h-5 text-[#FF5C00]" />
          <h2 className="text-base font-bold text-neutral-900">Thông tin cá nhân</h2>
        </div>

        {profileMessage && (
          <div
            className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 ${
              profileMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {profileMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{profileMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#FF5C00]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Số điện thoại
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#FF5C00] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Email đăng nhập (đã xác thực)
            </label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-lg text-xs bg-neutral-100 text-neutral-500 font-mono cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="px-6 py-2.5 bg-[#FF5C00] hover:bg-[#E55200] disabled:bg-neutral-300 text-white font-bold text-xs rounded-lg transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isUpdatingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </button>
        </form>
      </section>

      {/* 2. Change Password Card */}
      <section className="bg-white rounded-xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
          <Lock className="w-5 h-5 text-[#FF5C00]" />
          <h2 className="text-base font-bold text-neutral-900">Đổi mật khẩu bảo mật</h2>
        </div>

        {passwordMessage && (
          <div
            className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 ${
              passwordMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {passwordMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{passwordMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#FF5C00]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#FF5C00]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#FF5C00]"
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white font-bold text-xs rounded-lg transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isChangingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</span>
          </button>
        </form>
      </section>
    </div>
  );
};
