import { notFound } from "next/navigation";

import { API_BASE_URL } from "@/lib/backend";
import AddToCartButton from "@/components/product/AddToCartButton";
import PriceTag from "@/components/product/PriceTag";
import ProductGallery from "@/components/product/ProductGallery";
import ProductSpecs from "@/components/product/ProductSpecs";
import type { Product } from "@/types/product";

async function loadProduct(slug: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/store/products/slug/${slug}`, { next: { revalidate: 30 } });
    if (!response.ok) return null;
    return (await response.json()) as Product;
  } catch {
    return null;
  }
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await loadProduct(params.slug);
  if (!product) notFound();
  const inStock = product.available_quantity > 0;

  return (
    <main className="store-container grid gap-10 py-12 lg:grid-cols-2">
      <ProductGallery imageUrl={product.image_url} name={product.name} />
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">{product.brand ?? "FLOWAI"}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{product.name}</h1>
        <p className="mt-3 text-slate-600">{product.description ?? product.short_description}</p>
        <div className="mt-6 flex items-center gap-4">
          <PriceTag amount={product.price_amount} currency={product.currency} className="text-3xl" />
          <span className={inStock ? "text-sm text-emerald-700" : "text-sm text-red-600"}>
            {inStock ? `${product.available_quantity} in stock` : "Out of stock"}
          </span>
        </div>
        <div className="mt-6">
          <AddToCartButton productId={product.id} disabled={!inStock} />
        </div>
        <p className="mt-4 text-xs text-slate-500">SKU {product.sku} · Price and availability come from the server.</p>
        <div className="mt-8">
          <ProductSpecs specifications={product.specifications} />
        </div>
      </div>
    </main>
  );
}
