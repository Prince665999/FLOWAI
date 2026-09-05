"use client";

import { useUiStore } from "@/store/uiStore";

export function ToastHost() {
  const toasts = useUiStore((state) => state.toasts);
  const dismissToast = useUiStore((state) => state.dismissToast);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismissToast(toast.id)}
          className={`rounded-xl border px-4 py-3 text-left text-sm shadow-lg ${
            toast.kind === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : toast.kind === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-white text-slate-800"
          }`}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}
