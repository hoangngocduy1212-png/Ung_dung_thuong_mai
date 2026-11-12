import { request } from "./api.js";

export const getCategories = () => request("/categories", { auth: false });
export const getBrands = () => request("/brands", { auth: false });
export const getShops = () => request("/auth/shops", { auth: false });

/** params: q, category, brand, shop, minPrice, maxPrice, sort (newest|price_asc|price_desc|popular|rating), page, limit */
export const getProducts = (params, signal) => request("/products", { auth: false, params, signal });

export const getProduct = (id) => request(`/products/${encodeURIComponent(id)}`, { auth: false });

export const getWishlist = () => request("/customer/wishlist");
export const addWishlist = (productId) => request(`/customer/wishlist/${encodeURIComponent(productId)}`, { method: "POST" });
export const removeWishlist = (productId) => request(`/customer/wishlist/${encodeURIComponent(productId)}`, { method: "DELETE" });
