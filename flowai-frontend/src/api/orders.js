import { apiRequest } from "./client";
export const listOrders = (params) => apiRequest("/api/v1/admin/orders", { params });
export const listCustomerOrders = (params) => apiRequest("/api/v1/store/orders", { params });
export const getOrder = (id) => apiRequest(`/api/v1/admin/orders/${id}`);
export const getCustomerOrder = (id) => apiRequest(`/api/v1/store/orders/${id}`);
export const updateOrderStatus = (id, status) => apiRequest(`/api/v1/admin/orders/${id}/status`, { method: "PUT", body: { status } });
