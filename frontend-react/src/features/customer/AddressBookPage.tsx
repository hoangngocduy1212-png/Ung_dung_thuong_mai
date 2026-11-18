import React, { useState, useEffect } from 'react';
import { customerService } from '../../services/customerService';
import { Modal } from '../../components/common/Modal';
import { Loading } from '../../components/common/Loading';
import type { Address } from '../../types/customer';
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Check,
} from 'lucide-react';

export const AddressBookPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Form state
  const [receiver, setReceiver] = useState('');
  const [phone, setPhone] = useState('');
  const [detail, setDetail] = useState('');
  const [ward, setWard] = useState('Phường Bến Nghé');
  const [district, setDistrict] = useState('Quận 1');
  const [province, setProvince] = useState('TP. Hồ Chí Minh');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAddresses();
      setAddresses(Array.isArray(data) ? data : []);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddModal = () => {
    setEditingAddress(null);
    setReceiver('');
    setPhone('');
    setDetail('');
    setWard('Phường Bến Nghé');
    setDistrict('Quận 1');
    setProvince('TP. Hồ Chí Minh');
    setIsDefault(addresses.length === 0);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setReceiver(addr.receiver);
    setPhone(addr.phone);
    setDetail(addr.detail);
    setWard(addr.ward || '');
    setDistrict(addr.district || '');
    setProvince(addr.province || '');
    setIsDefault(!!addr.isDefault);
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (addrId?: string) => {
    if (!addrId) return;
    const ok = window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này không?');
    if (!ok) return;

    try {
      const updated = await customerService.deleteAddress(addrId);
      setAddresses(Array.isArray(updated) ? updated : []);
    } catch (err: any) {
      alert(err?.message || 'Không thể xóa địa chỉ.');
    }
  };

  const handleSetDefault = async (addr: Address) => {
    if (!addr._id || addr.isDefault) return;
    try {
      const updated = await customerService.updateAddress(addr._id, { isDefault: true });
      setAddresses(Array.isArray(updated) ? updated : []);
    } catch (err: any) {
      alert(err?.message || 'Không thể đặt địa chỉ mặc định.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiver || !phone || !detail) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      let updated: Address[];
      if (editingAddress?._id) {
        updated = await customerService.updateAddress(editingAddress._id, {
          receiver,
          phone,
          detail,
          ward,
          district,
          province,
          isDefault,
        });
      } else {
        updated = await customerService.addAddress({
          receiver,
          phone,
          detail,
          ward,
          district,
          province,
          isDefault,
        });
      }
      setAddresses(Array.isArray(updated) ? updated : []);
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Có lỗi khi lưu địa chỉ.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Sổ địa chỉ nhận hàng
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Quản lý địa chỉ nhận hàng để quá trình đặt hàng diễn ra thuận tiện và nhanh chóng
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#FF5C00] hover:bg-[#E55200] text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm địa chỉ mới</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12">
          <Loading message="Đang tải sổ địa chỉ..." />
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-neutral-300 p-12 text-center space-y-3">
          <MapPin className="w-10 h-10 text-neutral-400 mx-auto" />
          <h3 className="text-base font-bold text-neutral-900">Chưa có địa chỉ nhận hàng nào</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Thêm địa chỉ giao hàng đầu tiên để tiết kiệm thời gian khi thanh toán các đơn hàng sau này.
          </p>
          <button
            onClick={openAddModal}
            className="mt-2 px-5 py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition"
          >
            Thêm địa chỉ ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`p-5 rounded-xl border bg-white shadow-xs flex flex-col justify-between transition ${
                addr.isDefault ? 'border-2 border-[#FF5C00]' : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-neutral-900">{addr.receiver}</span>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-50 text-[#FF5C00] border border-orange-200">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs text-neutral-600 font-medium">{addr.phone}</span>
                </div>

                <p className="text-xs text-neutral-800 leading-relaxed font-medium">
                  {addr.detail}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {[addr.ward, addr.district, addr.province].filter(Boolean).join(', ')}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr)}
                    className="text-neutral-500 hover:text-[#FF5C00] font-medium transition cursor-pointer"
                  >
                    Thiết lập mặc định
                  </button>
                ) : (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                    <Check className="w-3.5 h-3.5" />
                    Địa chỉ nhận hàng chính
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openEditModal(addr)}
                    className="text-neutral-600 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Sửa</span>
                  </button>
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="text-neutral-400 hover:text-red-500 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Address */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddress ? 'Chỉnh sửa địa chỉ nhận hàng' : 'Thêm địa chỉ nhận hàng mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Họ tên người nhận <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-1 focus:ring-[#FF5C00]"
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-1 focus:ring-[#FF5C00] font-mono"
                placeholder="0912 345 678"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Địa chỉ chi tiết (số nhà, tên ngõ/tòa nhà) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-1 focus:ring-[#FF5C00]"
              placeholder="128 Thái Hà..."
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Phường / Xã</label>
              <input
                type="text"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full px-2.5 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-1 focus:ring-[#FF5C00]"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Quận / Huyện</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-2.5 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-1 focus:ring-[#FF5C00]"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Tỉnh / Thành</label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-2.5 py-2 border border-neutral-300 rounded-lg outline-none focus:ring-1 focus:ring-[#FF5C00]"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 text-[#FF5C00] rounded focus:ring-0"
              />
              <span className="text-neutral-700 font-medium">Đặt làm địa chỉ nhận hàng mặc định</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#FF5C00] hover:bg-[#E55200] disabled:bg-neutral-300 text-white font-bold rounded-lg transition"
            >
              {saving ? 'Đang lưu...' : 'Lưu địa chỉ'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
