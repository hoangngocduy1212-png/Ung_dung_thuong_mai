import { request } from "./api.js";

export const getPoints = () => request("/customer/points");