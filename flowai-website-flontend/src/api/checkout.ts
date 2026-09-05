import { apiClient } from "./client";
import type { CheckoutQuote } from "@/types/cart";
import type { Order } from "@/types/order";

export const getCheckoutQuote = (address_id?: number) =>
  apiClient.get<CheckoutQuote>("/api/v1/store/checkout/quote", {
    params: { address_id },
  });

export const placeOrder = (payload: {
  address_id: number;
  idempotency_key: string;
  payment_method?: string;
}) => apiClient.post<Order>("/api/v1/store/checkout", payload);
