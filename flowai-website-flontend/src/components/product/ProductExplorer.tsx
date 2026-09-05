"use client";

import { useSearchParams } from "next/navigation";

import ProductFilters from "@/components/product/ProductFilters";
import ProductGrid from "@/components/product/ProductGrid";
import { useProducts } from "@/hooks/useProducts";
import { PAGE_SIZE } from "@/lib/constants";
import type { Category } from "@/types/category";
import type { ProductQuery } from "@/types/product";

export default function ProductExplorer({
  categories = [],
  fixedCategoryId,
  title,
  subtitle,
}: {
  categories?: Category[];
  fixedCategoryId?: number;
  title: string;
  subtitle?: string;
}) {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? searchParams.get("q") ?? undefined;
  const categoryId = fixedCategoryId ?? (searchParams.get("category_id") ? Number(searchParams.get("category_id")) : undefined);
  const sort = (searchParams.get("sort") as ProductQuery["sort"]) ?? "newest";
  const available = searchParams.get("is_available");
  const page = Number(searchParams.get("page") ?? "1");

  const query: ProductQuery = {
    search,
    category_id: Number.isFinite(categoryId) ? categoryId : undefined,
    sort,
    is_available: available === "true" ? true : available === "false" ? false : undefined,
    page,
    page_size: PAGE_SIZE,
  };

  const { data, isLoading, error } = useProducts(query);

  return (
    <main className="store-container py-10">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle ? <p className="mt-2 text-slate-600">{subtitle}</p> : null}
      <div className="mt-6">
        <ProductFilters categories={fixedCategoryId ? [] : categories} />
      </div>
      <ProductGrid
        products={data?.items ?? []}
        loading={isLoading}
        error={error instanceof Error ? error.message : null}
      />
      {data && data.total_pages > 1 ? (
        <p className="mt-6 text-center text-sm text-slate-500">
          Page {data.page} of {data.total_pages} · {data.total} products
        </p>
      ) : null}
    </main>
  );
}
