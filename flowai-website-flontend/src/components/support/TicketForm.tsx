"use client";

import { useState } from "react";

import { ticketSchema } from "@/lib/validators/ticket";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";

export default function TicketForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (values: { subject: string; description: string; priority: string }) => Promise<void> | void;
  submitting?: boolean;
}) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    const parsed = ticketSchema.safeParse({ subject, description, priority });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form");
      return;
    }
    setError(null);
    await onSubmit({
      subject: parsed.data.subject,
      description: parsed.data.description,
      priority: parsed.data.priority,
    });
    setSubject("");
    setDescription("");
  }

  return (
    <form onSubmit={handleSubmit} className="store-card space-y-3 p-5">
      <h2 className="font-semibold">Open a ticket</h2>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
      <textarea
        className="store-input min-h-28"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="How can we help?"
      />
      <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="low">Low</option>
        <option value="normal">Normal</option>
        <option value="high">High</option>
      </Select>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Sending…" : "Submit ticket"}
      </Button>
    </form>
  );
}
