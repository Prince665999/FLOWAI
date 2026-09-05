import { apiClient } from "./client";
import type { Product } from "../types/product";
export const listProducts = (params = {}) => apiClient.get<Product[]>("/store/products", { params });
export const getProduct = (id: string | number) => apiClient.get<Product>(`/store/products/${id}`);
