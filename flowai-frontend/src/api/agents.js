import { apiRequest } from "./client";

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export function listTools(token) {
  return apiRequest("/api/v1/agents/tools", { headers: authHeaders(token) });
}

export function listToolCalls(token) {
  return apiRequest("/api/v1/agents/tool-calls", { headers: authHeaders(token) });
}

export function invokeTool(token, toolName, argumentsPayload) {
  return apiRequest(`/api/v1/agents/tools/${toolName}`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ arguments: argumentsPayload }),
  });
}