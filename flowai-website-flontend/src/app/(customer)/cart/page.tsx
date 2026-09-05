"use client";

import { useCart } from "@/hooks/useCart";
import CartItemRow from "@/components/cart/CartItemRow";
import CartSummary from "@/components/cart/CartSummary";

export default function CartPage() {
  const { data, isLoading, error, updateItem, removeItem } = useCart();

  return (
    <main className="store-container py-10">
      <h1 className="text-3xl font-bold">Your cart</h1>
      {isLoading ? <p className="mt-6 text-sm text-slate-500">Loading cart…</p> : null}
      {error ? <p className="mt-6 text-sm text-red-600">Sign in to view your cart.</p> : null}
      {data ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="store-card px-5">
            {data.items.length ? (
              data.items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  currency={data.currency}
                  onUpdate={(quantity) => updateItem.mutate({ itemId: item.id, quantity })}
                  onRemove={() => removeItem.mutate(item.id)}
                />
              ))
            ) : (
              <p className="py-10 text-sm text-slate-500">Your cart is empty.</p>
            )}
          </div>
          <CartSummary subtotal={data.subtotal_amount} currency={data.currency} />
        </div>
      ) : null}
    </main>
  );
}
