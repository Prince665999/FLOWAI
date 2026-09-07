import { apiRequest } from "./client";
export const listTickets = (params) => apiRequest("/api/v1/customer/support/tickets", { params });
export const getTicket = (id) => apiRequest(`/api/v1/customer/support/tickets/${id}`);
export const createTicket = (payload) => apiRequest("/api/v1/customer/support/tickets", { method: "POST", body: payload });
export const listStaffTickets = () => apiRequest("/api/v1/admin/support/tickets");
export const getStaffTicket = (id) => apiRequest(`/api/v1/admin/support/tickets/${id}`);
export const updateStaffTicket = (id, payload) => apiRequest(`/api/v1/admin/support/tickets/${id}`, { method: "PATCH", body: payload });
