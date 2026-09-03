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

export function listAgents(token) {
  return apiRequest("/api/v1/agents", { headers: authHeaders(token) });
}

export function listAgentRuns(token) {
  return apiRequest("/api/v1/agents/runs", { headers: authHeaders(token) });
}

export function startAgentRun(token, objective, agentId = null) {
  return apiRequest("/api/v1/agents/runs", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ objective, agent_id: agentId }),
  });
}

export function getAgentRun(token, runId) {
  return apiRequest(`/api/v1/agents/runs/${runId}`, { headers: authHeaders(token) });
}