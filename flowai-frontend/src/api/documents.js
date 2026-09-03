import { API_BASE_URL, apiRequest } from "./client";

function authHeaders(token) {
	return { Authorization: `Bearer ${token}` };
}

export function listDocuments(token) {
	return apiRequest("/api/v1/documents", { headers: authHeaders(token) });
}

export async function uploadDocument(token, asset) {
	const formData = new FormData();
	formData.append("file", {
		uri: asset.uri,
		name: asset.name || "document",
		type: asset.mimeType || "application/octet-stream",
	});

	const response = await fetch(`${API_BASE_URL}/api/v1/documents`, {
		method: "POST",
		headers: authHeaders(token),
		body: formData,
	});

	if (!response.ok) {
		throw new Error((await response.text()) || "Unable to upload document");
	}
	return response.json();
}
