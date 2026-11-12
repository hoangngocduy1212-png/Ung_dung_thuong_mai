import { request } from "./api.js";

export const getAddresses = () => request("/customer/addresses");
export const createAddress = (data) => request("/customer/addresses", { method: "POST", body: data });
export const updateAddress = (id, data) => request(`/customer/addresses/${encodeURIComponent(id)}`, { method: "PUT", body: data });
export const deleteAddress = (id) => request(`/customer/addresses/${encodeURIComponent(id)}`, { method: "DELETE" });
