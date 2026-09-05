import { apiClient } from "./client"; import type { Order } from "../types/order";
export const listOrders=()=>apiClient.get<Order[]>("/store/orders"); export const getOrder=(id:string|number)=>apiClient.get<Order>(`/store/orders/${id}`);
