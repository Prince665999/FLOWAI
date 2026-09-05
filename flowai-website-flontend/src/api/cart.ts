import { apiClient } from "./client";
import type { Cart } from "../types/cart";
export const getCart=()=>apiClient.get<Cart>("/store/cart").then(r=>r.data);
export const addCartItem=(product_id:number,quantity:number)=>apiClient.post<Cart>("/store/cart/items",{product_id,quantity}).then(r=>r.data);
export const updateCartItem=(id:number,quantity:number)=>apiClient.put<Cart>(`/store/cart/items/${id}`,{quantity}).then(r=>r.data);
export const removeCartItem=(id:number)=>apiClient.delete<Cart>(`/store/cart/items/${id}`).then(r=>r.data);
