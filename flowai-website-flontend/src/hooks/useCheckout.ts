"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { getCheckoutQuote, placeOrder } from "@/api/checkout";
import { useUiStore } from "@/store/uiStore";

export function useCheckoutQuote(addressId?: number) {
  return useQuery({
    queryKey: ["checkout-quote", addressId],
    queryFn: () => getCheckoutQuote(addressId),
  });
}

export function usePlaceOrder() {
  const pushToast = useUiStore((state) => state.pushToast);
  return useMutation({
    mutationFn: placeOrder,
    onError: (error) =>
      pushToast("error", error instanceof Error ? error.message : "Checkout failed"),
  });
}
