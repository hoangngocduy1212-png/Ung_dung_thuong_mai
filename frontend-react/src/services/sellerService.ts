import { api } from '../lib/api';
import type {
  SellerShop,
  SellerStats,
  SellerVoucher,
  SellerAfterSales,
  CreateProductPayload,
} from '../types/seller';
import type { Product } from '../types/catalog';
import type { Order } from '../types/order';

export const sellerService = {
  getShop: () => api.get<SellerShop>('/seller/shop'),
  updateShop: (data: Partial<SellerShop>) => api.put<SellerShop>('/seller/shop', data),
  getStats: () => api.get<SellerStats>('/seller/stats'),

  getProducts: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<{ items: Product[]; total: number; page: number; limit: number }>(
      '/seller/products',
      { params }
    ),
  getProductById: (id: string) => api.get<Product>(`/seller/products/${id}`),
  createProduct: (data: CreateProductPayload) => api.post<Product>('/seller/products', data),
  updateProduct: (id: string, data: Partial<CreateProductPayload>) =>
    api.put<Product>(`/seller/products/${id}`, data),
  toggleVisibility: (id: string, hidden: boolean) =>
    api.patch<Product>(`/seller/products/${id}/visibility`, { hidden }),
  deleteProduct: (id: string) => api.delete(`/seller/products/${id}`),

  getInventory: (params?: { threshold?: number }) =>
    api.get<Array<{ _id: string; product: string; productName?: string; image?: string; name: string; stock: number; price: number; sku?: string }>>('/seller/inventory', { params }),
  updateStock: (productId: string, variantId: string, payload: { stock?: number; delta?: number }) =>
    api.patch(`/seller/products/${productId}/variants/${variantId}/stock`, payload),

  getOrders: (params?: Record<string, string | number | undefined>) =>
    api.get<{ items: Order[]; total: number; page: number; limit: number }>(
      '/seller/orders',
      { params }
    ),
  getOrderById: (id: string) => api.get<Order>(`/seller/orders/${id}`),
  updateOrderStatus: (id: string, status: 'da_xac_nhan' | 'dang_giao' | 'da_giao') =>
    api.patch<Order>(`/seller/orders/${id}/status`, { status }),
  rejectOrder: (id: string, reason: string) =>
    api.post<Order>(`/seller/orders/${id}/reject`, { reason }),

  getAfterSales: (params?: { status?: string }) =>
    api.get<SellerAfterSales[]>('/seller/after-sales', { params }),
  handleAfterSales: (id: string, data: { decision: 'accept' | 'reject'; note: string }) =>
    api.patch<SellerAfterSales>(`/seller/after-sales/${id}`, data),

  getVouchers: () => api.get<SellerVoucher[]>('/seller/vouchers'),
  createVoucher: (data: Omit<SellerVoucher, '_id' | 'remaining' | 'shop'>) =>
    api.post<SellerVoucher>('/seller/vouchers', data),
  updateVoucher: (id: string, data: Partial<SellerVoucher>) =>
    api.put<SellerVoucher>(`/seller/vouchers/${id}`, data),
  deleteVoucher: (id: string) => api.delete(`/seller/vouchers/${id}`),
};
