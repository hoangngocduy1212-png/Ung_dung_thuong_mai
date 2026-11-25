export type OrderStatus =
  | 'cho_xac_nhan'
  | 'da_xac_nhan'
  | 'dang_giao'
  | 'da_giao'
  | 'hoan_tat'
  | 'da_huy'
  | 'da_tra_hang';

export interface OrderItem {
  product?: string;
  variant?: string;
  productName?: string;
  name?: string;
  variantName?: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface OrderShippingAddress {
  receiver?: string;
  fullName?: string;
  phone: string;
  detail: string;
  ward?: string;
  district?: string;
  province?: string;
  note?: string;
}

export interface OrderStatusHistory {
  status: string;
  at: string;
  by?: string;
  note?: string;
}

export interface OrderPayment {
  method: 'cod' | 'online';
  status: 'unpaid' | 'paid' | 'refunded' | 'da_thanh_toan' | 'chua_thanh_toan';
  paidAt?: string;
  txnId?: string;
}

export interface Order {
  _id: string;
  code: string;
  groupCode: string;
  customer: string | { _id: string; fullName: string; phone?: string; email?: string };
  shop: string | { _id: string; name: string; logo?: string };
  items: OrderItem[];
  shippingAddress: OrderShippingAddress;
  note?: string;
  shippingMethod?: 'standard' | 'express';
  subtotal: number;
  shippingFee: number;
  voucherCode?: string;
  voucherDiscount?: number;
  discount: number;
  total: number;
  sellerRevenue?: number;
  status: OrderStatus;
  statusHistory?: OrderStatusHistory[];
  payment: OrderPayment;
  deliveredAt?: string;
  completedAt?: string;
  pointsEarned?: number;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutPayload {
  cartItemIds?: string[];
  addressId?: string;
  address?: OrderShippingAddress;
  shippingMethod?: 'standard' | 'express';
  paymentMethod: 'cod' | 'online';
  note?: string;
  vouchers?: Record<string, string>; // shopId -> userVoucherId
}

export interface VNPayCreateUrlResult {
  paymentUrl: string;
  txnRef: string;
  groupCode: string;
  amount: number;
  expiresAt: string;
}

export interface VNPayVerifyResult {
  isValid: boolean;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'expired';
  vnpayReportedSuccess?: boolean;
  isOrderPaid?: boolean;
  groupCode?: string;
  txnRef?: string;
  amount?: number;
  currency?: string;
  responseCode?: string;
  transactionStatus?: string;
  bankCode?: string;
  bankTranNo?: string;
  vnpTransactionNo?: string;
  payDate?: string;
  canRetry?: boolean;
  message?: string;
  orders?: {
    _id: string;
    code: string;
    total: number;
    paymentStatus: string;
    status: string;
  }[];
}
