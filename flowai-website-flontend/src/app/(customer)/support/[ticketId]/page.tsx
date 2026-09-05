"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { getTicket } from "@/api/support";
import TicketThread from "@/components/support/TicketThread";

export default function TicketDetailPage() {
  const params = useParams<{ ticketId: string }>();
  const ticketQuery = useQuery({
    queryKey: ["tickets", params.ticketId],
    queryFn: () => getTicket(params.ticketId),
  });

  if (ticketQuery.isLoading) return <main className="store-container py-12 text-sm text-slate-500">Loading ticket…</main>;
  if (!ticketQuery.data) return <main className="store-container py-12 text-sm text-red-600">Ticket not found.</main>;

  return (
    <main className="store-container py-10">
      <TicketThread ticket={ticketQuery.data} />
    </main>
  );
}
