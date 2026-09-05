"use client";

import { useState } from "react";

import { createPaymentIntent } from "@/api/payments";
import Button from "@/components/ui/button";
import { useUiStore } from "@/store/uiStore";

export default function PaymentStep({
  orderId,
  onPaid,
}: {
  orderId: number;
  onPaid: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const pushToast = useUiStore((state) => state.pushToast);

  async function pay() {
    setStatus("processing");
    try {
      await createPaymentIntent(orderId, `pay-${orderId}-${crypto.randomUUID()}`);
      setStatus("success");
      pushToast("success", "Payment recorded");
      onPaid();
    } catch (error) {
      setStatus("error");
      pushToast("error", error instanceof Error ? error.message : "Payment failed");
    }
  }

  return (
    <div className="store-card p-5">
      <h2 className="font-semibold">Payment</h2>
      <p className="mt-2 text-sm text-slate-500">
        Test mode: no real card is charged. This records a verified test payment against the order.
      </p>
      {status === "success" ? (
        <p className="mt-3 text-sm font-medium text-emerald-700">Payment succeeded.</p>
      ) : (
        <Button className="mt-4" onClick={() => void pay()} disabled={status === "processing"}>
          {status === "processing" ? "Processing…" : "Pay with test provider"}
        </Button>
      )}
      {status === "error" ? <p className="mt-2 text-sm text-red-600">Payment failed. Try again.</p> : null}
    </div>
  );
}
