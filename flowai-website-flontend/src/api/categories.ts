import { apiClient } from "./client";
import type { Category } from "@/types/category";
import type { ProductPage, ProductQuery } from "@/types/product";

export const listCategories = () => apiClient.get<Category[]>("/api/v1/store/categories");

export const getCategoryBySlug = (slug: string) =>
  apiClient.get<Category>(`/api/v1/store/categories/slug/${slug}`);

export const listCategoryProducts = (categoryId: number, params: ProductQuery = {}) =>
  apiClient.get<ProductPage>(`/api/v1/store/categories/${categoryId}/products`, {
    params: params as Record<string, string | number | boolean | null | undefined>,
  });
