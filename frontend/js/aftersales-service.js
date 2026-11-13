import { request } from "./api.js";

export const getMyAfterSales = () => request("/customer/after-sales");
export const requestAfterSales = (orderId, type, reason) =>
  request(`/customer/orders/${encodeURIComponent(orderId)}/after-sales`, { method: "POST", body: { type, reason } });