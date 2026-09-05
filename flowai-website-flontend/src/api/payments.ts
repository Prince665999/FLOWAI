import { apiClient } from "./client"; import type { Payment } from "../types/payment";
export const createPaymentIntent=(order_id:number,idempotency_key:string)=>apiClient.post<Payment>("/store/payments/create-intent",{order_id,idempotency_key});
