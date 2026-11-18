import type { Product, ProductVariant, PlatformVoucher } from './catalog';

export interface Address {
  _id?: string;
  receiver: string;
  phone: string;
  detail: string;
  ward?: string;
  district?: string;
  province?: string;
  isDefault?: boolean;
}

export interface CartItem {
  _id?: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface CartData {
  _id?: string;
  items: CartItem[];
  totalAmount?: number;
}

export interface UserVoucher {
  _id: string;
  voucher: PlatformVoucher;
  source: 'claim' | 'points';
  status: 'unused' | 'used';
  usedAt?: string;
  order?: string;
}

export interface PointsSummary {
  points: number;
  history?: Array<{
    _id: string;
    delta: number;
    type: 'earn' | 'redeem' | 'revoke';
    note?: string;
    createdAt?: string;
  }>;
}

export interface Complaint {
  _id: string;
  code: string;
  customer?: { _id: string; fullName: string; email?: string; phone?: string };
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  order: string;
  orderCode: string;
  reason: string;
  title?: string;
  content?: string;
  status: 'moi' | 'dang_xu_ly' | 'chuyen_admin' | 'da_xu_ly';
  assignedTo?: { _id: string; fullName: string };
  responses?: Array<{
    by?: { _id?: string; fullName?: string; role?: string };
    role?: string;
    content: string;
    at: string;
  }>;
  result?: string;
  escalateNote?: string;
  escalatedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}
