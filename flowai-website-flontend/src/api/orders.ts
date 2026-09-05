import { apiClient } from "./client";
import type { Order } from "@/types/order";

export const listOrders = () => apiClient.get<Order[]>("/api/v1/store/orders");

export const getOrder = (id: string | number) =>
  apiClient.get<Order>(`/api/v1/store/orders/${id}`);

export const cancelOrder = (id: string | number) =>
  apiClient.post<Order>(`/api/v1/store/orders/${id}/cancel`);
