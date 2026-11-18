import { api } from '../lib/api';
import type { User } from '../types/auth';
import type {
  Address,
  CartData,
  UserVoucher,
  PointsSummary,
  Complaint,
} from '../types/customer';
import type { Product, PlatformVoucher } from '../types/catalog';
import type { Order, CheckoutPayload } from '../types/order';

export const customerService = {
  // Profile
  getProfile: () => api.get<User>('/customer/profile'),
  updateProfile: (data: { fullName?: string; phone?: string }) =>
    api.put<User>('/customer/profile', data),

  // Addresses
  getAddresses: () => api.get<Address[]>('/customer/addresses'),
  addAddress: (data: Omit<Address, '_id'>) =>
    api.post<Address[]>('/customer/addresses', data),
  updateAddress: (id: string, data: Partial<Address>) =>
    api.put<Address[]>(`/customer/addresses/${id}`, data),
  deleteAddress: (id: string) =>
    api.delete<Address[]>(`/customer/addresses/${id}`),

  // Cart
  getCart: () => api.get<CartData>('/customer/cart'),
  addToCart: (productId: string, variantId: string, quantity: number = 1) =>
    api.post<CartData>('/customer/cart/items', { productId, variantId, quantity }),
  updateCartItem: (itemId: string, quantity: number) =>
    api.patch<CartData>(`/customer/cart/items/${itemId}`, { quantity }),
  removeCartItem: (itemId: string) =>
    api.delete<CartData>(`/customer/cart/items/${itemId}`),

  // Wishlist
  getWishlist: () => api.get<{ products: Product[] }>('/customer/wishlist'),
  addToWishlist: (productId: string) =>
    api.post<{ message: string }>(`/customer/wishlist/${productId}`),
  removeFromWishlist: (productId: string) =>
    api.delete<{ message: string }>(`/customer/wishlist/${productId}`),

  // Vouchers & Points
  getAvailableVouchers: (shopId?: string) =>
    api.get<PlatformVoucher[]>('/customer/vouchers/available', {
      params: shopId ? { shop: shopId } : undefined,
    }),
  claimVoucher: (id: string) =>
    api.post<UserVoucher>(`/customer/vouchers/${id}/claim`),
  redeemVoucher: (id: string) =>
    api.post<UserVoucher>(`/customer/vouchers/${id}/redeem`),
  getMyVouchers: () => api.get<UserVoucher[]>('/customer/my-vouchers'),
  getPoints: () => api.get<PointsSummary>('/customer/points'),

  // Orders & Checkout
  checkout: (payload: CheckoutPayload) =>
    api.post<{ orders: Order[]; groupCode: string }>('/customer/orders/checkout', payload),
  payGroup: (groupCode: string) =>
    api.post<{ orders: Order[] }>(`/customer/orders/group/${groupCode}/pay`),
  getOrders: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<{ items: Order[]; total: number; page: number; limit: number }>(
      '/customer/orders',
      { params }
    ),
  getOrderById: (id: string) => api.get<Order>(`/customer/orders/${id}`),
  cancelOrder: (id: string, reason?: string) =>
    api.post<Order>(`/customer/orders/${id}/cancel`, { reason }),
  confirmReceived: (id: string) =>
    api.post<Order>(`/customer/orders/${id}/confirm-received`),
  requestAfterSales: (
    id: string,
    data: { type: 'huy_don' | 'hoan_tien' | 'doi_hang'; reason: string }
  ) => api.post(`/customer/orders/${id}/after-sales`, data),

  // Reviews
  createReview: (data: { orderId: string; productId: string; rating: number; content: string }) =>
    api.post('/customer/reviews', data),

  // Complaints
  createComplaint: (data: {
    orderId: string;
    contactName: string;
    contactPhone: string;
    contactEmail?: string;
    reason: string;
  }) => api.post<Complaint>('/customer/complaints', data),
  getComplaints: () =>
    api.get<{ items: Complaint[]; total: number }>('/customer/complaints'),
};
