import { request } from "./api.js";

export const getProfile = () => request("/customer/profile");
export const updateProfile = (data) => request("/customer/profile", { method: "PUT", body: data });
export const changePassword = (oldPassword, newPassword) =>
  request("/auth/password", { method: "PUT", body: { oldPassword, newPassword } });