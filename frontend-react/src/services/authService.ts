import { api } from '../lib/api';
import { clearSession, getToken, getUser, saveSession, updateStoredUser } from '../lib/session';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCustomerData,
  RegisterSellerData,
  User,
} from '../types/auth';

export const authService = {
  login: async (credentials: LoginCredentials, remember = false): Promise<AuthResponse> => {
    const data = await api.post<AuthResponse>('/auth/login', credentials, { auth: false });
    if (data.token && data.user) {
      saveSession({ token: data.token, user: data.user }, remember);
    }
    return data;
  },

  registerCustomer: async (payload: RegisterCustomerData, remember = false): Promise<AuthResponse> => {
    const body = {
      fullName: payload.fullName || payload.name || '',
      email: payload.email,
      phone: payload.phone || '',
      password: payload.password,
    };
    const data = await api.post<AuthResponse>('/auth/register', body, { auth: false });
    if (data.token && data.user) {
      saveSession({ token: data.token, user: data.user }, remember);
    }
    return data;
  },

  forgotPassword: async (email: string): Promise<{ message: string; devResetToken?: string }> => {
    return await api.post<{ message: string; devResetToken?: string }>(
      '/auth/forgot-password',
      { email },
      { auth: false }
    );
  },

  registerSeller: async (payload: RegisterSellerData, remember = false): Promise<AuthResponse> => {
    const data = await api.post<AuthResponse>('/auth/register-seller', payload, { auth: false });
    if (data.token && data.user) {
      saveSession({ token: data.token, user: data.user }, remember);
    }
    return data;
  },

  getProfile: async (): Promise<User | null> => {
    if (!getToken()) return null;
    try {
      const data = await api.get<{ ok: boolean; user: User }>('/auth/me');
      if (data.user) {
        updateStoredUser(data.user);
        return data.user;
      }
      return null;
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        clearSession();
        return null;
      }
      return getUser(); // Fallback to cached user if offline
    }
  },

  logout: async (): Promise<void> => {
    if (getToken()) {
      try {
        await api.post('/auth/logout', undefined, { timeout: 3000 });
      } catch {
        // JWT is stateless; server logout is best-effort
      }
    }
    clearSession();
  },

  getCurrentUser: (): User | null => getUser(),
  getCurrentToken: (): string | null => getToken(),
};
