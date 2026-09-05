import { formatDate } from "@/lib/formatters";
import type { SupportTicket } from "@/types/support";

import OrderStatusBadge from "@/components/orders/OrderStatusBadge";

export default function TicketThread({ ticket }: { ticket: SupportTicket }) {
  return (
    <article className="store-card p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{ticket.subject}</h1>
          <p className="mt-1 text-sm text-slate-500">{formatDate(ticket.created_at)}</p>
        </div>
        <OrderStatusBadge status={ticket.status} />
      </div>
      <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-700">{ticket.description}</p>
      {ticket.resolution ? (
        <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Resolution</p>
          <p className="mt-1">{ticket.resolution}</p>
        </div>
      ) : null}
    </article>
  );
}
