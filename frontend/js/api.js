import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "./config.js";
import { clearSession, getToken } from "./session.js";

export const NETWORK_ERROR_MESSAGE = "Không kết nối được máy chủ, vui lòng thử lại";

export class ApiError extends Error {
  constructor(message, status = 0, details, network = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    this.network = network;
  }
}

function buildQuery(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== "") search.set(key, value);
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

/**
 * Gọi API dùng chung. Backend trả lỗi dạng { message, details } cùng mã HTTP.
 * options: method, body, params, auth (mặc định true), redirectOn401 (mặc định true), timeout, signal
 */
export async function request(path, options = {}) {
  const { method = "GET", body, params, auth = true, redirectOn401 = true, timeout = REQUEST_TIMEOUT_MS, signal } = options;
  const headers = { Accept: "application/json" };
  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isFormData) headers["Content-Type"] = "application/json";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), timeout);
  if (signal) signal.addEventListener("abort", () => controller.abort(signal.reason), { once: true });

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}${buildQuery(params)}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (signal?.aborted && error?.name === "AbortError") throw error; // bị hủy chủ động (ví dụ gõ tìm kiếm tiếp)
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0, undefined, true);
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401 && token && redirectOn401) {
      clearSession();
      window.location.replace("./auth.html?tab=login");
    }
    const message = data?.message || (response.status >= 500 ? "Lỗi máy chủ, vui lòng thử lại sau" : "Yêu cầu không thành công");
    throw new ApiError(message, response.status, data?.details);
  }
  return data;
}
