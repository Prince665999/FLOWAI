import Link from "next/link";

import type { Product } from "@/types/product";

import PriceTag from "./PriceTag";

function Placeholder({ name }: { name: string }) {
  return (
    <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-sky-100 text-2xl font-bold text-brand-700">
      {name.slice(0, 1)}
    </div>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const inStock = product.available_quantity > 0;
  return (
    <article className="store-card overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block p-4">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="aspect-[4/3] w-full rounded-xl object-cover" />
        ) : (
          <Placeholder name={product.name} />
        )}
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">{product.brand ?? "FLOWAI"}</p>
        <h2 className="mt-1 text-base font-semibold text-slate-900">{product.name}</h2>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{product.short_description}</p>
        <div className="mt-3 flex items-center justify-between">
          <PriceTag amount={product.price_amount} currency={product.currency} className="text-lg" />
          <span className={`text-xs font-medium ${inStock ? "text-emerald-700" : "text-red-600"}`}>
            {inStock ? "In stock" : "Out of stock"}
          </span>
        </div>
      </Link>
    </article>
  );
}
