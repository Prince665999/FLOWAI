"use client";

import { useParams } from "next/navigation";

import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import OrderTimeline from "@/components/orders/OrderTimeline";
import Button from "@/components/ui/button";
import { formatDate, formatMoney } from "@/lib/formatters";
import { useCancelOrder, useOrder } from "@/hooks/useOrders";

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const { data, isLoading, error } = useOrder(params.orderId);
  const cancelOrder = useCancelOrder();

  if (isLoading) return <main className="store-container py-12 text-sm text-slate-500">Loading order…</main>;
  if (error || !data) return <main className="store-container py-12 text-sm text-red-600">Order not found.</main>;

  return (
    <main className="store-container grid gap-8 py-10 lg:grid-cols-[1fr_280px]">
      <section>
        <p className="text-sm text-slate-500">{formatDate(data.created_at)}</p>
        <h1 className="mt-1 text-3xl font-bold">{data.order_number}</h1>
        <div className="mt-3 flex gap-2">
          <OrderStatusBadge status={data.status} />
          <OrderStatusBadge status={data.payment_status} />
        </div>
        <ul className="mt-8 store-card divide-y divide-slate-100">
          {data.items.map((item) => (
            <li key={item.id} className="flex justify-between px-5 py-4 text-sm">
              <span>
                {item.product_name}
                <span className="block text-slate-500">SKU {item.sku} × {item.quantity}</span>
              </span>
              <span className="font-medium">{formatMoney(item.line_total_amount, data.currency)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-right text-lg font-semibold">{formatMoney(data.total_amount, data.currency)}</p>
        {data.status !== "cancelled" && data.status !== "delivered" ? (
          <Button
            variant="danger"
            className="mt-4"
            disabled={cancelOrder.isPending}
            onClick={() => cancelOrder.mutate(data.id)}
          >
            Request cancellation
          </Button>
        ) : null}
      </section>
      <aside className="store-card p-5">
        <h2 className="mb-4 font-semibold">Status</h2>
        <OrderTimeline order={data} />
      </aside>
    </main>
  );
}
