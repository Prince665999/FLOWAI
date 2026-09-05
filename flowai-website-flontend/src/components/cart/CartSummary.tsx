import Link from "next/link";

import { formatMoney } from "@/lib/formatters";

export default function CartSummary({
  subtotal,
  tax = 0,
  shipping = 0,
  total,
  currency,
  checkoutHref = "/checkout",
}: {
  subtotal: number;
  tax?: number;
  shipping?: number;
  total?: number;
  currency: string;
  checkoutHref?: string;
}) {
  const grandTotal = total ?? subtotal + tax + shipping;
  return (
    <aside className="store-card h-fit p-5">
      <h2 className="font-semibold">Order summary</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatMoney(subtotal, currency)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Tax</dt>
          <dd>{formatMoney(tax, currency)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd>{formatMoney(shipping, currency)}</dd>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatMoney(grandTotal, currency)}</dd>
        </div>
      </dl>
      <Link
        href={checkoutHref}
        className="mt-5 block rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-700"
      >
        Continue to checkout
      </Link>
    </aside>
  );
}
