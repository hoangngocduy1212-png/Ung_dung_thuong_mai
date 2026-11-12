import { request } from "./api.js";

export const getPlatformVouchers = () => request("/vouchers/platform", { auth: false });
export const getAvailableVouchers = (shop) => request("/customer/vouchers/available", { params: shop ? { shop } : {} });
export const claimVoucher = (id) => request(`/customer/vouchers/${encodeURIComponent(id)}/claim`, { method: "POST" });
export const redeemVoucher = (id) => request(`/customer/vouchers/${encodeURIComponent(id)}/redeem`, { method: "POST" });
export const getMyVouchers = (status = "unused") => request("/customer/my-vouchers", { params: { status } });
