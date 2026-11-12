import { request } from "./api.js";

export const checkout = (data) => request("/customer/orders/checkout", { method: "POST", body: data });
export const payOrderGroup = (groupCode) => request(`/customer/orders/group/${encodeURIComponent(groupCode)}/pay`, { method: "POST" });
export const getOrders = (params = {}) => request("/customer/orders", { params });
export const getOrder = (id) => request(`/customer/orders/${encodeURIComponent(id)}`);
export const cancelOrder = (id, reason) => request(`/customer/orders/${encodeURIComponent(id)}/cancel`, { method: "POST", body: { reason } });
export const requestAfterSales = (id, type, reason) => request(`/customer/orders/${encodeURIComponent(id)}/after-sales`, { method: "POST", body: { type, reason } });
export const confirmReceived = (id) => request(`/customer/orders/${encodeURIComponent(id)}/confirm-received`, { method: "POST" });
