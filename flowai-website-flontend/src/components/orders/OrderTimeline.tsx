import { formatStatus } from "@/lib/formatters";
import type { Order } from "@/types/order";

const STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrderTimeline({ order }: { order: Order }) {
  const current = STEPS.indexOf(order.status);
  return (
    <ol className="space-y-3">
      {STEPS.map((step, index) => (
        <li key={step} className="flex items-center gap-3 text-sm">
          <span
            className={`h-3 w-3 rounded-full ${
              order.status === "cancelled"
                ? "bg-red-400"
                : index <= current
                  ? "bg-brand-600"
                  : "bg-slate-200"
            }`}
          />
          <span className={index <= current && order.status !== "cancelled" ? "font-medium" : "text-slate-500"}>
            {formatStatus(step)}
          </span>
        </li>
      ))}
    </ol>
  );
}
