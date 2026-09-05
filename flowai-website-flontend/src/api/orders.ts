import { apiClient } from "./client"; import type { Order } from "../types/order";
export const listOrders=()=>apiClient.get<Order[]>("/store/orders").then(r=>r.data); export const getOrder=(id:string|number)=>apiClient.get<Order>(`/store/orders/${id}`).then(r=>r.data);
