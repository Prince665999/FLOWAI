import { apiRequest } from "./client";

const headers = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

export const listProducts = (token) => apiRequest("/api/v1/admin/products", { headers: headers(token) });
export const getProduct = (token, id) => apiRequest(`/api/v1/admin/products/${id}`, { headers: headers(token) });
export const createProduct = (token, payload) => apiRequest("/api/v1/admin/products", { method: "POST", headers: headers(token), body: payload });
export const updateProduct = (token, id, payload) => apiRequest(`/api/v1/admin/products/${id}`, { method: "PUT", headers: headers(token), body: payload });
export const publishProduct = (token, id) => apiRequest(`/api/v1/admin/products/${id}/publish`, { method: "POST", headers: headers(token) });
export const unpublishProduct = (token, id) => apiRequest(`/api/v1/admin/products/${id}/unpublish`, { method: "POST", headers: headers(token) });
