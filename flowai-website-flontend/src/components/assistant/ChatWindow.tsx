"use client";

import { useEffect, useState } from "react";

import {
  createConversation,
  getConversation,
  listConversations,
  sendConversationMessage,
} from "@/api/conversations";
import Button from "@/components/ui/button";
import type { Conversation, ConversationMessage } from "@/types/support";

import MessageBubble from "./MessageBubble";

export default function ChatWindow() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function boot() {
      try {
        const existing = await listConversations();
        const current = existing[0] ?? (await createConversation("Product assistant"));
        const full = await getConversation(current.id);
        setConversation(full);
        setMessages(full.messages ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to start assistant");
      } finally {
        setLoading(false);
      }
    }
    void boot();
  }, []);

  async function send() {
    if (!conversation || !draft.trim()) return;
    const content = draft.trim();
    setDraft("");
    setSending(true);
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", content, created_at: new Date().toISOString() },
    ]);
    try {
      const reply = await sendConversationMessage(conversation.id, content);
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, role: "assistant", content: reply, created_at: new Date().toISOString() },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Message failed");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Starting assistant…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="store-card flex h-[70vh] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {messages.length ? (
          messages.map((message) => (
            <MessageBubble key={message.id} role={message.role} content={message.content} />
          ))
        ) : (
          <p className="text-sm text-slate-500">
            Ask about published products, warranties, or your own orders. Facts come from the catalog, not invented prices.
          </p>
        )}
      </div>
      <form
        className="flex gap-2 border-t border-slate-200 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <input
          className="store-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about a product or an order"
        />
        <Button type="submit" disabled={sending}>
          Send
        </Button>
      </form>
    </div>
  );
}
