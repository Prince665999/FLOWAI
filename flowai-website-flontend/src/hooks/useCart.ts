"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { addCartItem, getCart, removeCartItem, updateCartItem } from "@/api/cart";
import { useAuth } from "@/hooks/useAuth";
import { useUiStore } from "@/store/uiStore";

export function useCart() {
  const queryClient = useQueryClient();
  const { isAuthenticated, loading } = useAuth();
  const pushToast = useUiStore((state) => state.pushToast);

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: isAuthenticated && !loading,
    retry: false,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["cart"] });

  const addItem = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      addCartItem(productId, quantity),
    onSuccess: async () => {
      await invalidate();
      pushToast("success", "Added to cart");
    },
    onError: (error) => pushToast("error", error instanceof Error ? error.message : "Unable to add item"),
  });

  const updateItem = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      updateCartItem(itemId, quantity),
    onSuccess: invalidate,
    onError: (error) => pushToast("error", error instanceof Error ? error.message : "Unable to update item"),
  });

  const removeItem = useMutation({
    mutationFn: (itemId: number) => removeCartItem(itemId),
    onSuccess: invalidate,
    onError: (error) => pushToast("error", error instanceof Error ? error.message : "Unable to remove item"),
  });

  const itemCount = cartQuery.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return { ...cartQuery, itemCount, addItem, updateItem, removeItem };
}
