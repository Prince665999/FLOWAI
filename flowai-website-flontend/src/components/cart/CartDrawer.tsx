"use client";

import Link from "next/link";

import { useCart } from "@/hooks/useCart";
import { useCartUiStore } from "@/store/cartUiStore";

import CartItemRow from "./CartItemRow";

export default function CartDrawer() {
  const open = useCartUiStore((state) => state.open);
  const closeDrawer = useCartUiStore((state) => state.closeDrawer);
  const { data, updateItem, removeItem, itemCount } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40" onClick={closeDrawer}>
      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold">Cart ({itemCount})</h2>
          <button type="button" onClick={closeDrawer} className="text-sm text-slate-500">
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5">
          {data?.items.length ? (
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
        <div className="border-t border-slate-200 p-5">
          <Link
            href="/cart"
            onClick={closeDrawer}
            className="block rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white"
          >
            View cart and checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}
