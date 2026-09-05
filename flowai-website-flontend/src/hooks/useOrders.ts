"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cancelOrder, getOrder, listOrders } from "@/api/orders";
import { useUiStore } from "@/store/uiStore";

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: listOrders,
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => getOrder(orderId),
    enabled: Boolean(orderId),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  const pushToast = useUiStore((state) => state.pushToast);
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      pushToast("success", "Order cancelled");
    },
    onError: (error) => pushToast("error", error instanceof Error ? error.message : "Unable to cancel"),
  });
}
