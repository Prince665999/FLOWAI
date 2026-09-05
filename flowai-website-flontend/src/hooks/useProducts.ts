"use client";

import { useQuery } from "@tanstack/react-query";

import { listProducts } from "@/api/products";
import type { ProductQuery } from "@/types/product";

export function useProducts(params: ProductQuery) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => listProducts(params),
  });
}
