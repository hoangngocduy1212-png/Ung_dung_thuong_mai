import type { ShopSummary } from './catalog';

export interface AdminStats {
  gmv?: number;
  revenue?: number;
  orderCount?: number;
  platformDiscount?: number;
  topShops?: Array<{ shop: string; name: string; revenue: number }>;
  totals?: {
    customers: number;
    activeShops: number;
    pendingShops: number;
    complaintsWaitingAdmin: number;
  };
  totalRevenue?: number;
  totalOrders?: number;
  totalCustomers?: number;
  totalShops?: number;
  pendingShops?: number;
  ordersByStatus?: Record<string, number>;
  revenueByMonth?: Array<{ _id: string; total: number }>;
}

export interface AdminCustomer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'customer';
  status: 'active' | 'locked';
  points: number;
  createdAt: string;
}

export interface AdminShopItem extends ShopSummary {
  owner?: { fullName: string; email: string; phone: string };
  nameKey?: string;
  rejectReason?: string;
  createdAt: string;
}

export interface AdminStaff {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'cskh';
  status: 'active' | 'locked';
  createdAt: string;
}
