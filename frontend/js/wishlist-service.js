import { request } from "./api.js";

export const getWishlist = () => request("/customer/wishlist");
export const addWishlist = (productId) => request(`/customer/wishlist/${encodeURIComponent(productId)}`, { method: "POST" });
export const removeWishlist = (productId) => request(`/customer/wishlist/${encodeURIComponent(productId)}`, { method: "DELETE" });