import Link from "next/link";

import { formatDate, formatMoney } from "@/lib/formatters";
import type { Order } from "@/types/order";

import OrderStatusBadge from "./OrderStatusBadge";

export default function OrderList({ orders }: { orders: Order[] }) {
  if (!orders.length) {
    return <p className="text-sm text-slate-500">You have not placed an order yet.</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link key={order.id} href={`/account/orders/${order.id}`} className="store-card block p-4 hover:border-brand-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">{order.order_number}</p>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {formatDate(order.created_at)} · {formatMoney(order.total_amount, order.currency)}
          </p>
        </Link>
      ))}
    </div>
  );
}
