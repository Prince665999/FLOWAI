import { apiClient } from "./client";
import type { Cart } from "@/types/cart";

export const getCart = () => apiClient.get<Cart>("/api/v1/store/cart");

export const addCartItem = (product_id: number, quantity: number) =>
  apiClient.post<Cart>("/api/v1/store/cart/items", { product_id, quantity });

export const updateCartItem = (id: number, quantity: number) =>
  apiClient.put<Cart>(`/api/v1/store/cart/items/${id}`, { quantity });

export const removeCartItem = (id: number) =>
  apiClient.del<Cart>(`/api/v1/store/cart/items/${id}`);
