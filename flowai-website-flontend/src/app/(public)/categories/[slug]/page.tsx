import { notFound } from "next/navigation";
import { Suspense } from "react";

import { API_BASE_URL } from "@/lib/backend";
import ProductExplorer from "@/components/product/ProductExplorer";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import type { Category } from "@/types/category";

async function loadCategory(slug: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/store/categories/slug/${slug}`, { next: { revalidate: 60 } });
    if (!response.ok) return null;
    return (await response.json()) as Category;
  } catch {
    return null;
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await loadCategory(params.slug);
  if (!category) notFound();
  return (
    <Suspense fallback={<div className="store-container py-10"><ProductGridSkeleton /></div>}>
      <ProductExplorer
        fixedCategoryId={category.id}
        title={category.name}
        subtitle={category.description ?? "Products in this category."}
      />
    </Suspense>
  );
}
