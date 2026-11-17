import { request } from "./api.js";
import { clearSession, getToken, getUser, saveSession, updateStoredUser } from "./session.js";

export const ROLE_LABEL = { customer: "Khách hàng", seller: "Người bán", cskh: "CSKH", admin: "Quản trị viên" };

export const isCustomer = (user) => user?.role === "customer";

export function homeRedirectFor(user) {
  if (user?.role === "seller") return "./seller.html";
  if (user?.role === "cskh") return "./staff.html";
  return "./index.html";
}

export const login = (email, password) =>
  request("/auth/login", { method: "POST", body: { email, password }, auth: false });

export const registerCustomer = (data) =>
  request("/auth/register", { method: "POST", body: data, auth: false });

export const registerSeller = (data) =>
  request("/auth/register-seller", { method: "POST", body: data, auth: false });

export const listActiveShops = () => request("/auth/shops", { auth: false });

export const forgotPassword = (email) =>
  request("/auth/forgot-password", { method: "POST", body: { email }, auth: false });

export const resetPassword = (token, newPassword) =>
  request("/auth/reset-password", { method: "POST", body: { token, newPassword }, auth: false });

/** Lấy hồ sơ mới nhất từ máy chủ và đồng bộ vào bộ nhớ. Trả về user hoặc null nếu phiên không còn hợp lệ. */
export async function refreshProfile() {
  if (!getToken()) return null;
  try {
    const data = await request("/auth/me", { redirectOn401: false });
    updateStoredUser(data.user);
    return data.user;
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      clearSession();
      return null;
    }
    return getUser(); // mất mạng: dùng thông tin đã lưu
  }
}

export async function logout() {
  if (getToken()) {
    try {
      await request("/auth/logout", { method: "POST", redirectOn401: false, timeout: 4000 });
    } catch {
      /* JWT: phía máy chủ không giữ phiên, xóa token cục bộ là đủ */
    }
  }
  clearSession();
}

export { getToken, getUser, saveSession, clearSession };
