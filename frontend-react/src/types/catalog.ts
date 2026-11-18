export interface Category {
  _id: string;
  name: string;
  parent?: string | null;
  isDeleted?: boolean;
}

export interface Brand {
  _id: string;
  name: string;
  logo?: string;
  isDeleted?: boolean;
}

export interface ProductVariant {
  _id: string;
  product: string;
  name: string;
  sku?: string;
  price: number;
  stock: number;
  isDeleted?: boolean;
}

export interface ShopSummary {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  policy?: string;
  status?: 'pending' | 'active' | 'locked' | 'rejected';
  ratingAvg?: number;
  ratingCount?: number;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  images?: string[];
  minPrice?: number;
  soldCount?: number;
  ratingAvg?: number;
  ratingCount?: number;
  totalStock?: number;
  variantCount?: number;
  shop?: ShopSummary;
  category?: { _id: string; name: string };
  brand?: { _id: string; name: string };
  variants?: ProductVariant[];
  hidden?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductReview {
  _id: string;
  order: string;
  product: string;
  shop: string;
  customer?: { fullName: string };
  variantName?: string;
  rating: number;
  content: string;
  reply?: { content: string; by?: string; at?: string };
  createdAt?: string;
}

export interface PlatformVoucher {
  _id: string;
  code: string;
  title: string;
  scope?: 'platform' | 'shop';
  shop?: string;
  amount: number;
  minOrder: number;
  quantity?: number;
  remaining: number;
  startDate: string;
  endDate: string;
  pointsCost: number;
  active?: boolean;
}
