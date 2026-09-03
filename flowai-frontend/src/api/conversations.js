import { API_BASE_URL, apiRequest } from "./client";

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export function listConversations(token) {
  return apiRequest("/api/v1/conversations", {
    headers: authHeaders(token),
  });
}

export function createConversation(token, payload = {}) {
  return apiRequest("/api/v1/conversations", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function getConversation(token, conversationId) {
  return apiRequest(`/api/v1/conversations/${conversationId}`, {
    headers: authHeaders(token),
  });
}

export async function streamConversationMessage(token, conversationId, content, onToken) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify({ content }),
    },
  );

  if (!response.ok) {
    throw new Error((await response.text()) || "Unable to send message");
  }
  if (!response.body) {
    throw new Error("Streaming is not supported by this device");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let finished = false;
  while (!finished) {
    const result = await reader.read();
    finished = result.done;
    if (result.value) {
      onToken(decoder.decode(result.value, { stream: !finished }));
    }
  }
}