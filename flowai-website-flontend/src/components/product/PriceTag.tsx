import { formatMoney } from "@/lib/formatters";

export default function PriceTag({
  amount,
  currency,
  className = "",
}: {
  amount: number;
  currency: string;
  className?: string;
}) {
  return <span className={`font-semibold text-slate-900 ${className}`}>{formatMoney(amount, currency)}</span>;
}
