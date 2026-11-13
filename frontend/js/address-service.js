import { request } from "./api.js";

export const getAddresses = () => request("/customer/addresses");

function notifyAddressesChanged(addresses) {
	document.dispatchEvent(new CustomEvent("addresses:changed", { detail: { addresses } }));
	return addresses;
}

export const createAddress = async (data) => notifyAddressesChanged(
	await request("/customer/addresses", { method: "POST", body: data }),
);

export const updateAddress = async (id, data) => notifyAddressesChanged(
	await request(`/customer/addresses/${encodeURIComponent(id)}`, { method: "PUT", body: data }),
);

export const deleteAddress = async (id) => notifyAddressesChanged(
	await request(`/customer/addresses/${encodeURIComponent(id)}`, { method: "DELETE" }),
);
