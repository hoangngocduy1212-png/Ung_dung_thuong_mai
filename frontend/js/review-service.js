import { request } from "./api.js";

export const getProductReviews = (productId, params = {}) =>
  request(`/products/${encodeURIComponent(productId)}/reviews`, { auth: false, params });

export const submitReview = (data) =>
  request("/customer/reviews", { method: "POST", body: data });
