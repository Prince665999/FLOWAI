import { formatMoney } from "@/lib/formatters";
import type { CheckoutQuote } from "@/types/cart";

export default function OrderReview({ quote }: { quote: CheckoutQuote }) {
  return (
    <div className="store-card p-5">
      <h2 className="font-semibold">Review</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {quote.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-3">
            <span>
              {item.name ?? `Product #${item.product_id}`} × {item.quantity}
            </span>
            <span>{formatMoney(item.line_total_amount, quote.currency)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-right font-semibold">
        Total {formatMoney(quote.total_amount ?? quote.subtotal_amount, quote.currency)}
      </p>
    </div>
  );
}
