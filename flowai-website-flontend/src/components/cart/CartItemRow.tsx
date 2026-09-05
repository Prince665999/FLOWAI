"use client";

import Link from "next/link";

import { formatMoney } from "@/lib/formatters";
import type { CartItem } from "@/types/cart";

export default function CartItemRow({
  item,
  currency,
  onUpdate,
  onRemove,
}: {
  item: CartItem;
  currency: string;
  onUpdate?: (quantity: number) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="flex gap-4 border-b border-slate-100 py-4 last:border-0">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-lg font-semibold text-brand-700">
        {(item.name ?? "P").slice(0, 1)}
      </div>
      <div className="flex-1">
        <Link href={item.slug ? `/products/${item.slug}` : "/products"} className="font-medium text-slate-900">
          {item.name ?? `Product #${item.product_id}`}
        </Link>
        <p className="text-sm text-slate-500">{formatMoney(item.unit_price_amount, currency)} each</p>
        <div className="mt-2 flex items-center gap-2">
          {onUpdate ? (
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(event) => onUpdate(Number(event.target.value))}
              className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
          ) : (
            <span className="text-sm text-slate-600">Qty {item.quantity}</span>
          )}
          {onRemove ? (
            <button type="button" onClick={onRemove} className="text-xs text-red-600 hover:underline">
              Remove
            </button>
          ) : null}
        </div>
      </div>
      <p className="font-semibold">{formatMoney(item.line_total_amount, currency)}</p>
    </div>
  );
}
