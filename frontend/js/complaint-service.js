import { request } from "./api.js";

export const getMyComplaints = () => request("/customer/complaints");
export const getMyComplaint = (id) => request(`/customer/complaints/${encodeURIComponent(id)}`);
export const submitComplaint = (data) => request("/customer/complaints", { method: "POST", body: data });