import { request } from "./api.js";

export const getCart = () => request("/customer/cart");

export const addToCart = (productId, variantId, quantity = 1) =>
  request("/customer/cart/items", { method: "POST", body: { productId, variantId, quantity } });

export const countCartItems = (cart) => (cart?.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
