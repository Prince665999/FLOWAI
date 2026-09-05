import { apiClient } from "./client";
import type { Product } from "../types/product";
export const listProducts = (params = {}) => apiClient.get<Product[]>("/store/products", { params }).then((r) => r.data);
export const getProduct = (id: string | number) => apiClient.get<Product>(`/store/products/${id}`).then((r) => r.data);
