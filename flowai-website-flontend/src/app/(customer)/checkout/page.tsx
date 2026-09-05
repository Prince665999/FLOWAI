"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createAddress, listAddresses } from "@/api/addresses";
import AddressForm from "@/components/checkout/AddressForm";
import OrderReview from "@/components/checkout/OrderReview";
import ShippingStep from "@/components/checkout/ShippingStep";
import Button from "@/components/ui/button";
import { useCheckoutQuote, usePlaceOrder } from "@/hooks/useCheckout";

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const addressesQuery = useQuery({ queryKey: ["addresses"], queryFn: listAddresses });
  const [addressId, setAddressId] = useState<number | undefined>();
  const selected = addressId ?? addressesQuery.data?.[0]?.id;
  const quoteQuery = useCheckoutQuote(selected);
  const placeOrder = usePlaceOrder();
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!selected) return;
    const order = await placeOrder.mutateAsync({
      address_id: selected,
      idempotency_key: crypto.randomUUID(),
      payment_method: "test",
    });
    await queryClient.invalidateQueries({ queryKey: ["cart"] });
    router.push(`/checkout/confirmation/${order.id}`);
  }

  return (
    <main className="store-container grid gap-8 py-10 lg:grid-cols-2">
      <section>
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="mt-2 text-sm text-slate-500">Address and totals are validated on the server. The browser never submits a total.</p>
        <div className="mt-6">
          <h2 className="mb-3 font-semibold">Shipping address</h2>
          <ShippingStep
            addresses={addressesQuery.data ?? []}
            selectedId={selected}
            onSelect={setAddressId}
          />
        </div>
        <div className="mt-8">
          <h2 className="mb-3 font-semibold">Add an address</h2>
          <div className="store-card p-5">
            <AddressForm
              submitting={saving}
              onSubmit={async (values) => {
                setSaving(true);
                try {
                  const created = await createAddress(values);
                  await queryClient.invalidateQueries({ queryKey: ["addresses"] });
                  setAddressId(created.id);
                } finally {
                  setSaving(false);
                }
              }}
            />
          </div>
        </div>
      </section>
      <section className="space-y-4">
        {quoteQuery.data ? <OrderReview quote={quoteQuery.data} /> : <p className="text-sm text-slate-500">Loading quote…</p>}
        <Button onClick={() => void submit()} disabled={!selected || placeOrder.isPending}>
          {placeOrder.isPending ? "Placing order…" : "Place test order"}
        </Button>
      </section>
    </main>
  );
}
