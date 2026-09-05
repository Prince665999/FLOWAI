import { apiClient } from "./client";
import type { Address } from "@/types/address";
import type { AddressInput } from "@/lib/validators/address";

export const listAddresses = () => apiClient.get<Address[]>("/api/v1/customer/addresses");

export const createAddress = (payload: AddressInput) =>
  apiClient.post<Address>("/api/v1/customer/addresses", payload);

export const updateAddress = (id: number, payload: Partial<AddressInput>) =>
  apiClient.put<Address>(`/api/v1/customer/addresses/${id}`, payload);

export const deleteAddress = (id: number) =>
  apiClient.del(`/api/v1/customer/addresses/${id}`);
