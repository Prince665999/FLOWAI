import { Suspense } from "react";

import ProductExplorer from "@/components/product/ProductExplorer";
import { ProductGridSkeleton } from "@/components/ui/skeleton";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="store-container py-10"><ProductGridSkeleton /></div>}>
      <ProductExplorer title="Search" subtitle="Results are filtered by the backend catalog API." />
    </Suspense>
  );
}
