import { apiClient } from "./client";
import type { Conversation } from "@/types/support";

export const listConversations = () =>
  apiClient.get<Conversation[]>("/api/v1/conversations");

export const createConversation = (title = "Store assistant") =>
  apiClient.post<Conversation>("/api/v1/conversations", { title });

export const getConversation = (id: number) =>
  apiClient.get<Conversation>(`/api/v1/conversations/${id}`);

export async function sendConversationMessage(id: number, content: string) {
  const response = await fetch(`/api/v1/conversations/${id}/messages`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    throw new Error("Unable to send message");
  }
  return response.text();
}
