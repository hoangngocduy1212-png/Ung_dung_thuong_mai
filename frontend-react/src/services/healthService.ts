import { api } from '../lib/api';

export interface HealthResponse {
  ok: boolean;
  time?: string;
  uptime?: number;
  environment?: string;
}

export const healthService = {
  check: () => api.get<HealthResponse>('/health', { auth: false }),
};
