import { apiClient } from "./client";
import type { Category } from "../types/category";
export const listCategories = () => apiClient.get<Category[]>("/api/v1/store/categories");
