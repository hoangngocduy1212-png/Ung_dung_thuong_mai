import { STORAGE_KEYS } from "./config.js";

// "Ghi nhớ đăng nhập" -> localStorage, ngược lại -> sessionStorage
const stores = () => [window.localStorage, window.sessionStorage];

function read(key) {
  for (const store of stores()) {
    try {
      const value = store.getItem(key);
      if (value) return value;
    } catch {
      /* bỏ qua khi trình duyệt chặn storage */
    }
  }
  return null;
}

export const getToken = () => read(STORAGE_KEYS.token);

export function getUser() {
  try {
    return JSON.parse(read(STORAGE_KEYS.user) || "null");
  } catch {
    return null;
  }
}

export function clearSession() {
  for (const store of stores()) {
    try {
      store.removeItem(STORAGE_KEYS.token);
      store.removeItem(STORAGE_KEYS.user);
    } catch {
      /* ignore */
    }
  }
}

export function saveSession({ token, user }, remember = false) {
  clearSession();
  const store = remember ? window.localStorage : window.sessionStorage;
  store.setItem(STORAGE_KEYS.token, token);
  store.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

/** Cập nhật user đã lưu (giữ nguyên nơi lưu hiện tại). */
export function updateStoredUser(user) {
  for (const store of stores()) {
    if (store.getItem(STORAGE_KEYS.user)) store.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  }
}

export function setFlash(message) {
  try {
    window.sessionStorage.setItem(STORAGE_KEYS.flash, message);
  } catch {
    /* ignore */
  }
}

export function takeFlash() {
  try {
    const message = window.sessionStorage.getItem(STORAGE_KEYS.flash);
    window.sessionStorage.removeItem(STORAGE_KEYS.flash);
    return message;
  } catch {
    return null;
  }
}
