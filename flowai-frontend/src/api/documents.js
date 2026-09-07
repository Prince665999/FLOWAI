import { API_BASE_URL, apiRequest } from "./client";
import { File, UploadType } from "expo-file-system";

function authHeaders(token) {
	return { Authorization: `Bearer ${token}` };
}

export function listDocuments(token) {
	return apiRequest("/api/v1/documents", { headers: authHeaders(token) });
}

export async function uploadDocument(token, asset) {
	const result = await new File(asset.uri).upload(
		`${API_BASE_URL}/api/v1/documents`,
		{
			httpMethod: "POST",
			uploadType: UploadType.MULTIPART,
			fieldName: "file",
			mimeType: asset.mimeType || "application/octet-stream",
			headers: authHeaders(token),
		}
	);

	let payload;
	try {
		payload = JSON.parse(result.body);
	} catch {
		payload = null;
	}
	if (result.status < 200 || result.status >= 300) {
		throw new Error(payload?.detail || result.body || "Unable to upload document");
	}
	return payload;
}
