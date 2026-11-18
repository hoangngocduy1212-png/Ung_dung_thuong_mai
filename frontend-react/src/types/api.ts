export interface ApiErrorDetail {
  field?: string;
  message: string;
  [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
  ok?: boolean;
  message?: string;
  data?: T;
  details?: ApiErrorDetail[];
  [key: string]: unknown;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | boolean | null | undefined>;
  auth?: boolean;
  redirectOn401?: boolean;
  timeout?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}
