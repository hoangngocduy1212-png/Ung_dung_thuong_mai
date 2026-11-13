import { request } from "./api.js";

export const getPlatformVouchers = () => request("/vouchers/platform", { auth: false });
export const getAvailableVouchers = (shop) => request("/customer/vouchers/available", { params: shop ? { shop } : {} });

export async function claimVoucher(id) {
	const result = await request(`/customer/vouchers/${encodeURIComponent(id)}/claim`, { method: "POST" });
	document.dispatchEvent(new CustomEvent("vouchers:changed", { detail: { voucher: result } }));
	return result;
}

export async function redeemVoucher(id) {
	const result = await request(`/customer/vouchers/${encodeURIComponent(id)}/redeem`, { method: "POST" });
	document.dispatchEvent(new CustomEvent("vouchers:changed", { detail: { voucher: result.userVoucher } }));
	document.dispatchEvent(new CustomEvent("points:changed", { detail: { points: result.points } }));
	return result;
}

export const getMyVouchers = (status = "unused") => request("/customer/my-vouchers", { params: { status } });
