import { api } from '../lib/api';
import type {
  Category,
  Brand,
  Product,
  ProductReview,
  PlatformVoucher,
  ShopSummary,
} from '../types/catalog';

export const catalogService = {
  getCategories: () => api.get<Category[]>('/categories', { auth: false }),

  getBrands: () => api.get<Brand[]>('/brands', { auth: false }),

  getProducts: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<{ items: Product[]; total: number; page: number; limit: number }>('/products', {
      auth: false,
      params,
    }),

  getProductById: (id: string) =>
    api.get<Product>(`/products/${id}`, { auth: false }),

  getProductReviews: (id: string, params?: { page?: number; limit?: number }) =>
    api.get<{ items: ProductReview[]; total: number; page: number; limit: number }>(
      `/products/${id}/reviews`,
      { auth: false, params }
    ),

  getPlatformVouchers: () =>
    api.get<PlatformVoucher[]>('/vouchers/platform', { auth: false }),

  getShopById: (id: string) =>
    api.get<ShopSummary>(`/shops/${id}`, { auth: false }),
};
