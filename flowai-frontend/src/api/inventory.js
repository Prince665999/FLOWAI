import { apiRequest } from "./client";

const headers = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

export const listInventory = (token) => apiRequest("/api/v1/admin/inventory", { headers: headers(token) });
export const getInventory = (token, productId) => apiRequest(`/api/v1/admin/inventory/${productId}`, { headers: headers(token) });
export const adjustInventory = (token, productId, payload) => apiRequest(`/api/v1/admin/inventory/${productId}/adjust`, { method: "POST", headers: headers(token), body: payload });
export const listLowStock = (token) => apiRequest("/api/v1/admin/inventory/low-stock", { headers: headers(token) });
