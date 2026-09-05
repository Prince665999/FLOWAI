import { apiRequest } from "./client";
export const listOrders = (params) => apiRequest("/api/v1/admin/orders", { params });
export const getOrder = (id) => apiRequest(`/api/v1/admin/orders/${id}`);
export const updateOrderStatus = (id, status) => apiRequest(`/api/v1/admin/orders/${id}/status`, { method: "PUT", body: { status } });
