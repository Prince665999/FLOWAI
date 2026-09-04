import { apiRequest } from "./client";

const authHeaders = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

export function listWorkflows(token) {
  return apiRequest("/api/v1/workflows", { headers: authHeaders(token) });
}

// Alias for listWorkflows
export const getWorkflows = listWorkflows;

export function getWorkflow(workflowIdOrToken, maybeWorkflowId) {
  const workflowId = maybeWorkflowId || workflowIdOrToken;
  const token = maybeWorkflowId ? workflowIdOrToken : null;
  return apiRequest(`/api/v1/workflows/${workflowId}`, { headers: authHeaders(token) });
}

export function createWorkflow(payloadOrToken, maybePayload) {
  const payload = maybePayload || payloadOrToken;
  const token = maybePayload ? payloadOrToken : null;
  return apiRequest("/api/v1/workflows", {
    method: "POST",
    headers: authHeaders(token),
    body: payload,
  });
}

export function updateWorkflow(workflowIdOrToken, workflowIdOrPayload, maybePayload) {
  let token = null;
  let workflowId = workflowIdOrToken;
  let payload = workflowIdOrPayload;
  if (maybePayload !== undefined) {
    token = workflowIdOrToken;
    workflowId = workflowIdOrPayload;
    payload = maybePayload;
  }
  return apiRequest(`/api/v1/workflows/${workflowId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: payload,
  });
}

export function publishWorkflow(workflowIdOrToken, workflowIdOrComment, maybeComment) {
  let token = null;
  let workflowId = workflowIdOrToken;
  let comment = workflowIdOrComment || "Published new version";
  if (maybeComment !== undefined) {
    token = workflowIdOrToken;
    workflowId = workflowIdOrComment;
    comment = maybeComment;
  }
  return apiRequest(`/api/v1/workflows/${workflowId}/publish`, {
    method: "POST",
    headers: authHeaders(token),
    body: { comment },
  });
}

export function rollbackWorkflow(workflowIdOrToken, workflowIdOrVersion, maybeVersion) {
  let token = null;
  let workflowId = workflowIdOrToken;
  let targetVersion = workflowIdOrVersion;
  if (maybeVersion !== undefined) {
    token = workflowIdOrToken;
    workflowId = workflowIdOrVersion;
    targetVersion = maybeVersion;
  }
  return apiRequest(`/api/v1/workflows/${workflowId}/rollback`, {
    method: "POST",
    headers: authHeaders(token),
    body: { target_version: targetVersion },
  });
}

export function deleteWorkflow(workflowIdOrToken, maybeWorkflowId) {
  const workflowId = maybeWorkflowId || workflowIdOrToken;
  const token = maybeWorkflowId ? workflowIdOrToken : null;
  return apiRequest(`/api/v1/workflows/${workflowId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function runWorkflow(workflowIdOrToken, workflowIdOrInput, maybeInput) {
  let token = null;
  let workflowId = workflowIdOrToken;
  let inputData = workflowIdOrInput || {};
  if (maybeInput !== undefined) {
    token = workflowIdOrToken;
    workflowId = workflowIdOrInput;
    inputData = maybeInput || {};
  }
  return apiRequest(`/api/v1/workflows/${workflowId}/runs`, {
    method: "POST",
    headers: authHeaders(token),
    body: { input_data: inputData },
  });
}

export function getWorkflowRun(workflowIdOrToken, runIdOrWfId, maybeRunId) {
  let token = null;
  let workflowId = workflowIdOrToken;
  let runId = runIdOrWfId;
  if (maybeRunId !== undefined) {
    token = workflowIdOrToken;
    workflowId = runIdOrWfId;
    runId = maybeRunId;
  }
  return apiRequest(`/api/v1/workflows/${workflowId}/runs/${runId}`, {
    headers: authHeaders(token),
  });
}

export function listJobs(token) {
  return apiRequest("/api/v1/jobs", { headers: authHeaders(token) });
}

export function getJob(token, jobId) {
  return apiRequest(`/api/v1/jobs/${jobId}`, { headers: authHeaders(token) });
}

export function listWorkflowTemplates(token) {
  return apiRequest("/api/v1/workflow-templates", { headers: authHeaders(token) });
}
