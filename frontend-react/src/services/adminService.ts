import { api } from '../lib/api';
import type { AdminStats, AdminCustomer, AdminShopItem, AdminStaff } from '../types/admin';
import type { Category, Brand, PlatformVoucher } from '../types/catalog';
import type { Order } from '../types/order';
import type { Complaint } from '../types/customer';

export const adminService = {
  getStats: () => api.get<AdminStats>('/admin/stats'),

  getCustomers: (params?: Record<string, string | number | undefined>) =>
    api.get<{ items: AdminCustomer[]; total: number; page: number; limit: number }>(
      '/admin/customers',
      { params }
    ),
  lockCustomer: (id: string) => api.patch(`/admin/customers/${id}/lock`),
  unlockCustomer: (id: string) => api.patch(`/admin/customers/${id}/unlock`),

  getShops: (params?: Record<string, string | number | undefined>) =>
    api.get<{ items: AdminShopItem[]; total: number; page: number; limit: number }>(
      '/admin/shops',
      { params }
    ),
  approveShop: (id: string) => api.patch(`/admin/shops/${id}/approve`),
  rejectShop: (id: string, reason?: string) =>
    api.patch(`/admin/shops/${id}/reject`, { reason }),
  lockShop: (id: string) => api.patch(`/admin/shops/${id}/lock`),
  unlockShop: (id: string) => api.patch(`/admin/shops/${id}/unlock`),

  getStaff: () => api.get<AdminStaff[]>('/admin/cskh'),
  createStaff: (data: { email: string; phone: string; fullName: string; password?: string }) =>
    api.post<AdminStaff>('/admin/cskh', data),
  lockStaff: (id: string) => api.patch(`/admin/cskh/${id}/lock`),
  unlockStaff: (id: string) => api.patch(`/admin/cskh/${id}/unlock`),
  deleteStaff: (id: string) => api.delete(`/admin/cskh/${id}`),

  getVouchers: () => api.get<PlatformVoucher[]>('/admin/vouchers'),
  createVoucher: (data: Partial<PlatformVoucher>) =>
    api.post<PlatformVoucher>('/admin/vouchers', data),
  updateVoucher: (id: string, data: Partial<PlatformVoucher>) =>
    api.put<PlatformVoucher>(`/admin/vouchers/${id}`, data),
  deleteVoucher: (id: string) => api.delete(`/admin/vouchers/${id}`),

  createCategory: (data: { name: string; parent?: string | null }) =>
    api.post<Category>('/admin/categories', data),
  updateCategory: (id: string, data: { name: string; parent?: string | null }) =>
    api.put<Category>(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),

  createBrand: (data: { name: string; logo?: string }) =>
    api.post<Brand>('/admin/brands', data),
  updateBrand: (id: string, data: { name: string; logo?: string }) =>
    api.put<Brand>(`/admin/brands/${id}`, data),
  deleteBrand: (id: string) => api.delete(`/admin/brands/${id}`),

  getOrders: (params?: Record<string, string | number | undefined>) =>
    api.get<{ items: Order[]; total: number; page: number; limit: number }>(
      '/admin/orders',
      { params }
    ),

  getComplaints: (params?: Record<string, string | number | undefined>) =>
    api.get<{ items: Complaint[]; total: number; page: number; limit: number }>(
      '/admin/complaints',
      { params }
    ),
  resolveComplaint: (id: string, data: { result: string; forceRefund?: boolean }) =>
    api.post(`/admin/complaints/${id}/resolve`, data),
};
