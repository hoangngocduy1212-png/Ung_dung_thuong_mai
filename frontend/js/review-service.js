import { request } from "./api.js";

export const getProductReviews = (productId, params = {}) =>
  request(`/products/${encodeURIComponent(productId)}/reviews`, { auth: false, params });

export async function submitReview(data) {
  const result = await request("/customer/reviews", { method: "POST", body: data });
  document.dispatchEvent(new CustomEvent("reviews:changed", { detail: { review: result } }));
  return result;
}

export const getMyReviews = (params = {}) =>
  request("/customer/reviews", { params });

export async function getAllMyReviews() {
  const first = await getMyReviews({ page: 1, limit: 100 });
  const pages = [first];
  for (let page = 2; page <= first.totalPages; page++) pages.push(await getMyReviews({ page, limit: 100 }));
  return pages.flatMap((page) => page.items);
}
