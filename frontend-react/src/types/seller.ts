import type { ShopSummary } from './catalog';
import type { Order } from './order';

export interface SellerShop extends ShopSummary {
  owner: string;
  nameKey?: string;
  createdAt?: string;
}

export interface SellerStats {
  revenue: number;
  orderCount: number;
  productCount: number;
  ratingAvg: number;
  revenueByDay?: Array<{ _id: string; total: number }>;
}

export interface SellerVoucher {
  _id: string;
  code: string;
  title: string;
  scope: 'shop';
  shop: string;
  amount: number;
  minOrder: number;
  quantity: number;
  remaining: number;
  startDate: string;
  endDate: string;
  active: boolean;
  isDeleted?: boolean;
}

export interface SellerAfterSales {
  _id: string;
  order: Order | string;
  customer: { _id: string; fullName: string; phone?: string };
  shop: string;
  type: 'huy_don' | 'hoan_tien' | 'doi_hang';
  reason: string;
  status: 'cho_xu_ly' | 'da_chap_nhan' | 'bi_tu_choi';
  sellerNote?: string;
  createdAt: string;
}

export interface CreateProductPayload {
  name: string;
  category: string;
  brand?: string;
  description?: string;
  images?: string[];
  variants: Array<{
    name: string;
    sku?: string;
    price: number;
    stock: number;
  }>;
}
