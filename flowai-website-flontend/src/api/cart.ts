import { apiClient } from "./client";
import type { Cart } from "../types/cart";
export const getCart=()=>apiClient.get<Cart>("/store/cart");
export const addCartItem=(product_id:number,quantity:number)=>apiClient.post<Cart>("/store/cart/items",{product_id,quantity});
export const updateCartItem=(id:number,quantity:number)=>apiClient.put<Cart>(`/store/cart/items/${id}`,{quantity});
export const removeCartItem=(id:number)=>apiClient.del<Cart>(`/store/cart/items/${id}`);
