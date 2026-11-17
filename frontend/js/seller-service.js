import { request } from "./api.js";

const json = (path, method, body) => request(path, { method, body });
const query = (path, params) => request(path, { params });

export const getSellerProfile = () => request("/seller/profile");
export const updateSellerProfile = (data) => json("/seller/profile", "PUT", data);
export const getShop = () => request("/seller/shop");
export const updateShop = (data) => json("/seller/shop", "PUT", data);
export const uploadSellerImage = (file) => {
  const body = new FormData();
  body.append("image", file);
  return request("/seller/upload", { method: "POST", body });
};

export const getProducts = (params = {}) => query("/seller/products", params);
export const getProduct = (id) => request(`/seller/products/${id}`);
export const createProduct = (data) => json("/seller/products", "POST", data);
export const updateProduct = (id, data) => json(`/seller/products/${id}`, "PUT", data);
export const setProductVisibility = (id, hidden) => json(`/seller/products/${id}/visibility`, "PATCH", { hidden });
export const deleteProduct = (id) => request(`/seller/products/${id}`, { method: "DELETE" });
export const getInventory = (params = {}) => query("/seller/inventory", params);
export const updateStock = (productId, variantId, data) => json(`/seller/products/${productId}/variants/${variantId}/stock`, "PATCH", data);

export const getOrders = (params = {}) => query("/seller/orders", params);
export const getOrder = (id) => request(`/seller/orders/${id}`);
export const updateOrderStatus = (id, status) => json(`/seller/orders/${id}/status`, "PATCH", { status });
export const rejectOrder = (id, reason) => json(`/seller/orders/${id}/reject`, "POST", { reason });
export const getAfterSales = (params = {}) => query("/seller/after-sales", params);
export const decideAfterSales = (id, decision, note) => json(`/seller/after-sales/${id}`, "PATCH", { decision, note });

export const getVouchers = () => request("/seller/vouchers");
export const createVoucher = (data) => json("/seller/vouchers", "POST", data);
export const updateVoucher = (id, data) => json(`/seller/vouchers/${id}`, "PUT", data);
export const deleteVoucher = (id) => request(`/seller/vouchers/${id}`, { method: "DELETE" });
export const getReviews = (params = {}) => query("/seller/reviews", params);
export const replyReview = (id, content) => json(`/seller/reviews/${id}/reply`, "POST", { content });
export const getSellerStats = (params = {}) => query("/seller/stats", params);
export const getStaff = () => request("/seller/staff");
export const staffAction = (id, action) => json(`/seller/staff/${id}/${action}`, "PATCH", {});
