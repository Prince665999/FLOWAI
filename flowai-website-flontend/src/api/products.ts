import { apiClient } from "./client";
import type { Product, ProductPage, ProductQuery } from "@/types/product";

export const listProducts = (params: ProductQuery = {}) =>
  apiClient.get<ProductPage>("/api/v1/store/products", { params: params as Record<string, string | number | boolean | null | undefined> });

export const getProduct = (id: string | number) =>
  apiClient.get<Product>(`/api/v1/store/products/${id}`);

export const getProductBySlug = (slug: string) =>
  apiClient.get<Product>(`/api/v1/store/products/slug/${slug}`);
