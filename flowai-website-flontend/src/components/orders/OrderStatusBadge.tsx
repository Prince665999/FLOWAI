import { formatStatus } from "@/lib/formatters";
import Badge from "@/components/ui/badge";

const TONES: Record<string, "green" | "amber" | "red" | "blue" | "slate"> = {
  pending: "amber",
  confirmed: "blue",
  processing: "blue",
  fulfilled: "green",
  shipped: "green",
  delivered: "green",
  cancelled: "red",
  paid: "green",
  unpaid: "amber",
  succeeded: "green",
};

export default function OrderStatusBadge({ status }: { status: string }) {
  return <Badge tone={TONES[status] ?? "slate"}>{formatStatus(status)}</Badge>;
}
