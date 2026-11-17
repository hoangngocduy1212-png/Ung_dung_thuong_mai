import { request } from "./api.js";
import { clearSession, setFlash } from "./session.js";

export async function staffRequest(path, options = {}) {
  try {
    return await request(`/staff${path}`, { ...options, redirectOn401: false });
  } catch (error) {
    if (error.status === 401 || (error.status === 403 && /Tài khoản đã bị khóa|Tài khoản không tồn tại/.test(error.message))) {
      clearSession();
      setFlash(error.message);
      location.replace("./auth.html?tab=staff&view=login");
    }
    throw error;
  }
}

export const getStaffList = (resource, params) => staffRequest(`/${resource}`, { params });
export const getStaffDetail = (resource, id) => staffRequest(`/${resource}/${encodeURIComponent(id)}`);
export const actOnComplaint = (id, action, body) => staffRequest(`/complaints/${encodeURIComponent(id)}/${action}`, { method: "POST", body });
export const deleteStaffReview = (id) => staffRequest(`/reviews/${encodeURIComponent(id)}`, { method: "DELETE" });
