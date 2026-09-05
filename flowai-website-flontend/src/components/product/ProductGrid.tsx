import type { Product } from "@/types/product";
import { ProductGridSkeleton } from "@/components/ui/skeleton";

import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
  loading = false,
  error = null,
}: {
  products: Product[];
  loading?: boolean;
  error?: string | null;
}) {
  if (loading) return <ProductGridSkeleton />;
  if (error) {
    return (
      <div className="store-card p-8 text-center text-sm text-red-700">
        Unable to load products. {error}
      </div>
    );
  }
  if (!products.length) {
    return (
      <div className="store-card p-8 text-center text-sm text-slate-500">
        No products match these filters.
      </div>
    );
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
