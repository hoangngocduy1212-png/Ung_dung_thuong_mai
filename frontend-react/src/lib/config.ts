export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const REQUEST_TIMEOUT_MS = 10000;

export const STORAGE_KEYS = {
  token: 'techstore.token',
  user: 'techstore.user',
  flash: 'techstore.flash',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  customer: 'Khách hàng',
  seller: 'Người bán',
  cskh: 'CSKH',
  admin: 'Quản trị viên',
};

export const ROLE_HOME_PATHS: Record<string, string> = {
  customer: '/',
  seller: '/seller',
  cskh: '/cskh',
  admin: '/admin',
};
