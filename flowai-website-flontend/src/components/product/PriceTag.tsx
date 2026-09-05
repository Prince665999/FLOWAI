import { formatMoney } from "@/lib/formatters";
export default function PriceTag({ amount, currency }: { amount: number; currency: string }) { return <span className="text-lg font-bold text-slate-900">{formatMoney(amount, currency)}</span>; }
