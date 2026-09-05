"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createTicket, listTickets } from "@/api/support";
import TicketForm from "@/components/support/TicketForm";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";

export default function SupportPage() {
  const queryClient = useQueryClient();
  const ticketsQuery = useQuery({ queryKey: ["tickets"], queryFn: listTickets });
  const create = useMutation({
    mutationFn: createTicket,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  return (
    <main className="store-container grid gap-8 py-10 lg:grid-cols-2">
      <section>
        <h1 className="text-3xl font-bold">Support</h1>
        <div className="mt-6 space-y-3">
          {(ticketsQuery.data ?? []).map((ticket) => (
            <Link key={ticket.id} href={`/support/${ticket.id}`} className="store-card block p-4 hover:border-brand-200">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{ticket.subject}</p>
                <OrderStatusBadge status={ticket.status} />
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{ticket.description}</p>
            </Link>
          ))}
          {!ticketsQuery.data?.length ? <p className="text-sm text-slate-500">No tickets yet.</p> : null}
        </div>
      </section>
      <TicketForm submitting={create.isPending} onSubmit={async (values) => { await create.mutateAsync(values); }} />
    </main>
  );
}
