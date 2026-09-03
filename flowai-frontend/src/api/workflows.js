import { apiRequest } from "./client";

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

export function listWorkflows(token) {
	return apiRequest("/api/v1/workflows", { headers: authHeaders(token) });
}

export function getWorkflow(token, workflowId) {
	return apiRequest(`/api/v1/workflows/${workflowId}`, { headers: authHeaders(token) });
}

export function runWorkflow(token, workflowId, inputData = {}) {
	return apiRequest(`/api/v1/workflows/${workflowId}/runs`, {
		method: "POST",
		headers: authHeaders(token),
		body: JSON.stringify({ input_data: inputData }),
	});
}

export function getWorkflowRun(token, workflowId, runId) {
	return apiRequest(`/api/v1/workflows/${workflowId}/runs/${runId}`, { headers: authHeaders(token) });
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
