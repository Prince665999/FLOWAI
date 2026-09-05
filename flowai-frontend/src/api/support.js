import { apiRequest } from "./client";
export const listTickets = (params) => apiRequest("/api/v1/customer/support/tickets", { params });
export const getTicket = (id) => apiRequest(`/api/v1/customer/support/tickets/${id}`);
export const createTicket = (payload) => apiRequest("/api/v1/customer/support/tickets", { method: "POST", body: payload });
