import { apiClient } from "./client";
import type { SupportTicket } from "@/types/support";

export const listTickets = () =>
  apiClient.get<SupportTicket[]>("/api/v1/customer/support/tickets");

export const getTicket = (id: string | number) =>
  apiClient.get<SupportTicket>(`/api/v1/customer/support/tickets/${id}`);

export const createTicket = (payload: {
  subject: string;
  description: string;
  priority?: string;
  order_id?: number;
}) => apiClient.post<SupportTicket>("/api/v1/customer/support/tickets", payload);
