export type UserRole = 'customer' | 'seller' | 'cskh' | 'admin';

export interface User {
  _id: string;
  name: string;
  fullName?: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'locked';
  shopId?: string;
  points?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  ok?: boolean;
  token?: string;
  user: User;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCustomerData {
  name?: string;
  fullName?: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface RegisterSellerData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  sellerType: 'owner' | 'staff';
  shopName?: string;
  shopDescription?: string;
  shopId?: string;
}
