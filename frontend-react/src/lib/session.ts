import { STORAGE_KEYS } from './config';
import type { User } from '../types/auth';

const getStores = (): Storage[] => {
  if (typeof window === 'undefined') return [];
  return [window.localStorage, window.sessionStorage];
};

function read(key: string): string | null {
  for (const store of getStores()) {
    try {
      const val = store.getItem(key);
      if (val) return val;
    } catch {
      // Storage unavailable or blocked
    }
  }
  return null;
}

export function getToken(): string | null {
  return read(STORAGE_KEYS.token);
}

export function getUser(): User | null {
  try {
    const raw = read(STORAGE_KEYS.user);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  for (const store of getStores()) {
    try {
      store.removeItem(STORAGE_KEYS.token);
      store.removeItem(STORAGE_KEYS.user);
    } catch {
      // Ignore
    }
  }
}

export function saveSession(
  session: { token: string; user: User },
  remember = false
): void {
  clearSession();
  try {
    const store = remember ? window.localStorage : window.sessionStorage;
    store.setItem(STORAGE_KEYS.token, session.token);
    store.setItem(STORAGE_KEYS.user, JSON.stringify(session.user));
  } catch {
    // Ignore storage errors
  }
}

export function updateStoredUser(user: User): void {
  for (const store of getStores()) {
    try {
      if (store.getItem(STORAGE_KEYS.user)) {
        store.setItem(STORAGE_KEYS.user, JSON.stringify(user));
      }
    } catch {
      // Ignore
    }
  }
}
