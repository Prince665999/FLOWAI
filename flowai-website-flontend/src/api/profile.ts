import { apiClient } from "./client";
import type { User } from "@/types/user";

export interface CustomerProfile {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
}

export const getProfile = () => apiClient.get<CustomerProfile>("/api/v1/customer/profile");

export const updateProfile = (payload: Partial<Pick<CustomerProfile, "name" | "phone" | "company">>) =>
  apiClient.patch<CustomerProfile>("/api/v1/customer/profile", payload);

export type { User };
