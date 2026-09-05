"use client";

import OrderList from "@/components/orders/OrderList";
import { useOrders } from "@/hooks/useOrders";

export default function OrdersPage() {
  const { data, isLoading, error } = useOrders();
  return (
    <main className="store-container py-10">
      <h1 className="text-3xl font-bold">Your orders</h1>
      <p className="mt-2 text-sm text-slate-500">Only orders belonging to the signed-in customer are shown.</p>
      <div className="mt-8">
        {isLoading ? <p className="text-sm text-slate-500">Loading orders…</p> : null}
        {error ? <p className="text-sm text-red-600">Unable to load orders.</p> : null}
        {data ? <OrderList orders={data} /> : null}
      </div>
    </main>
  );
}
