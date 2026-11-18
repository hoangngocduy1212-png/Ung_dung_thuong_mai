import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config';
import { clearSession, getToken } from './session';
import type { RequestOptions, ApiErrorDetail } from '../types/api';

export const NETWORK_ERROR_MESSAGE = 'Không kết nối được máy chủ, vui lòng thử lại';

export class ApiError extends Error {
  status: number;
  details?: ApiErrorDetail[];
  network: boolean;

  constructor(message: string, status = 0, details?: ApiErrorDetail[], network = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.network = network;
  }
}

function buildQuery(params?: RequestOptions['params']): string {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  const str = search.toString();
  return str ? `?${str}` : '';
}

export async function request<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    params,
    auth = true,
    redirectOn401 = false, // In React SPA, let the router/auth provider handle redirects
    timeout = REQUEST_TIMEOUT_MS,
    signal,
    headers: customHeaders = {},
  } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...customHeaders,
  };

  const token = auth ? getToken() : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), timeout);

  if (signal) {
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  }

  let response: Response;
  const fullUrl = `${API_BASE_URL}${path}${buildQuery(params)}`;

  try {
    response = await fetch(fullUrl, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err: unknown) {
    if (signal?.aborted && (err as { name?: string })?.name === 'AbortError') {
      throw err;
    }
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0, undefined, true);
  } finally {
    clearTimeout(timer);
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      clearSession();
      if (redirectOn401 && typeof window !== 'undefined') {
        window.location.replace('/login');
      }
    }
    const message =
      data?.message ||
      (response.status >= 500
        ? 'Lỗi máy chủ nội bộ, vui lòng thử lại sau'
        : 'Yêu cầu không thành công');
    throw new ApiError(message, response.status, data?.details);
  }

  return data as T;
}

export const api = {
  get: <T = unknown>(path: string, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T = unknown>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),

  put: <T = unknown>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PUT', body }),

  patch: <T = unknown>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T = unknown>(path: string, options?: Omit<RequestOptions, 'method'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
