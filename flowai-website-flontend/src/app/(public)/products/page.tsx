import { Suspense } from "react";

import { API_BASE_URL } from "@/lib/backend";
import ProductExplorer from "@/components/product/ProductExplorer";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import type { Category } from "@/types/category";

async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/store/categories`, { next: { revalidate: 60 } });
    return response.ok ? ((await response.json()) as Category[]) : [];
  } catch {
    return [];
  }
}

export default async function ProductsPage() {
  const categories = await loadCategories();
  return (
    <Suspense fallback={<div className="store-container py-10"><ProductGridSkeleton /></div>}>
      <ProductExplorer
        categories={categories}
        title="Products"
        subtitle="Browse published business technology and office equipment."
      />
    </Suspense>
  );
}
