import { api } from '../lib/api';
import type { Complaint } from '../types/customer';
import type { Order } from '../types/order';

export interface StaffSummary {
  pool: number;
  mine: number;
  history: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StaffCustomer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'active' | 'locked';
  points: number;
  createdAt: string;
  addresses?: Array<{
    _id: string;
    receiver: string;
    phone: string;
    detail: string;
    isDefault?: boolean;
  }>;
  recentOrders?: Array<{
    _id: string;
    code: string;
    status: string;
    total: number;
    createdAt: string;
    shop?: { name: string };
  }>;
}

export interface StaffReview {
  _id: string;
  order: string;
  product: { _id: string; name: string };
  shop: { _id: string; name: string };
  customer: { _id: string; fullName: string };
  rating: number;
  content: string;
  variantName?: string;
  reply?: { content: string; at: string };
  isDeleted: boolean;
  createdAt: string;
}

export const staffService = {
  // KPI Overview
  getSummary: () => api.get<StaffSummary>('/staff/summary'),

  // Complaints
  getComplaints: (params?: { scope?: 'pool' | 'mine' | 'history'; q?: string; page?: number; limit?: number }) =>
    api.get<PagedResult<Complaint>>('/staff/complaints', { params }),

  getComplaintDetail: (id: string) =>
    api.get<Complaint>(`/staff/complaints/${id}`),

  respondComplaint: (id: string, content: string) =>
    api.post<Complaint>(`/staff/complaints/${id}/respond`, { content }),

  resolveComplaint: (id: string, result: string) =>
    api.post<Complaint>(`/staff/complaints/${id}/resolve`, { result }),

  escalateComplaint: (id: string, note: string) =>
    api.post<Complaint>(`/staff/complaints/${id}/escalate`, { note }),

  // Customers
  getCustomers: (params?: { q?: string; page?: number; limit?: number }) =>
    api.get<PagedResult<StaffCustomer>>('/staff/customers', { params }),

  getCustomerDetail: (id: string) =>
    api.get<StaffCustomer>(`/staff/customers/${id}`),

  // Orders
  getOrders: (params?: { q?: string; status?: string; page?: number; limit?: number }) =>
    api.get<PagedResult<Order>>('/staff/orders', { params }),

  getOrderDetail: (id: string) =>
    api.get<Order & { afterSales?: any[]; complaints?: any[] }>(`/staff/orders/${id}`),

  // Reviews Moderation
  getReviews: (params?: { q?: string; rating?: string; product?: string; page?: number; limit?: number }) =>
    api.get<PagedResult<StaffReview>>('/staff/reviews', { params }),

  deleteReview: (id: string) =>
    api.delete<{ message: string }>(`/staff/reviews/${id}`),
};
