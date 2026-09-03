import { apiRequest } from "./client";

export async function listCustomers() {
  return apiRequest("/api/v1/customers");
}

export async function createCustomer(payload) {
  return apiRequest("/api/v1/customers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCustomer(customerId) {
  return apiRequest(`/api/v1/customers/${customerId}`);
}

export async function updateCustomer(customerId, payload) {
  return apiRequest(`/api/v1/customers/${customerId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
