import { useState } from "react";

import { streamConversationMessage } from "../api/conversations";

export function useConversationStream(token, conversationId, initialMessages = []) {
  const [messages, setMessages] = useState(initialMessages);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const replaceMessages = (nextMessages) => {
    setMessages(nextMessages);
    setError(null);
  };

  const sendMessage = async (content) => {
    const trimmedContent = content.trim();
    if (!trimmedContent || sending) return;

    setSending(true);
    setError(null);
    setMessages((current) => [
      ...current,
      { id: `local-user-${Date.now()}`, role: "user", content: trimmedContent },
      { id: `local-assistant-${Date.now()}`, role: "assistant", content: "" },
    ]);

    try {
      await streamConversationMessage(token, conversationId, trimmedContent, (tokenChunk) => {
        setMessages((current) => {
          const next = [...current];
          const last = next[next.length - 1];
          if (last?.role === "assistant") {
            next[next.length - 1] = { ...last, content: `${last.content}${tokenChunk}` };
          }
          return next;
        });
      });
    } catch (err) {
      setError(err.message || "Unable to send message");
      setMessages((current) => current.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  return { messages, sending, error, replaceMessages, sendMessage };
}