"use client";

import { useState } from "react";

import Button from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useCartUiStore } from "@/store/cartUiStore";

export default function AddToCartButton({
  productId,
  disabled,
}: {
  productId: number;
  disabled?: boolean;
}) {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const openDrawer = useCartUiStore((state) => state.openDrawer);
  const [quantity, setQuantity] = useState(1);

  if (!isAuthenticated) {
    return (
      <a href="/login?next=/cart" className="inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">
        Sign in to add to cart
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
        className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <Button
        disabled={disabled || addItem.isPending}
        onClick={async () => {
          await addItem.mutateAsync({ productId, quantity });
          openDrawer();
        }}
      >
        {addItem.isPending ? "Adding…" : "Add to cart"}
      </Button>
    </div>
  );
}
