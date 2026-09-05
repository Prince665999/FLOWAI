"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import PaymentStep from "@/components/checkout/PaymentStep";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { formatMoney } from "@/lib/formatters";
import { useOrder } from "@/hooks/useOrders";

export default function OrderConfirmationPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useOrder(params.orderId);

  if (isLoading) return <main className="store-container py-12 text-sm text-slate-500">Loading confirmation…</main>;
  if (error || !data) return <main className="store-container py-12 text-sm text-red-600">Order not found.</main>;

  return (
    <main className="store-container max-w-2xl py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Order placed</p>
      <h1 className="mt-2 text-3xl font-bold">{data.order_number}</h1>
      <div className="mt-3 flex items-center gap-2">
        <OrderStatusBadge status={data.status} />
        <OrderStatusBadge status={data.payment_status} />
      </div>
      <p className="mt-4 text-lg font-semibold">{formatMoney(data.total_amount, data.currency)}</p>
      <ul className="mt-6 space-y-2 text-sm">
        {data.items.map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>{item.product_name} × {item.quantity}</span>
            <span>{formatMoney(item.line_total_amount, data.currency)}</span>
          </li>
        ))}
      </ul>
      {data.payment_status !== "paid" ? (
        <div className="mt-8">
          <PaymentStep
            orderId={data.id}
            onPaid={() => {
              void refetch();
              router.refresh();
            }}
          />
        </div>
      ) : (
        <p className="mt-8 text-sm text-emerald-700">Payment recorded.</p>
      )}
      <Link href={`/account/orders/${data.id}`} className="mt-6 inline-block text-sm font-medium text-brand-700 hover:underline">
        View order details
      </Link>
    </main>
  );
}
