import Link from "next/link";

import { API_BASE_URL } from "@/lib/backend";
import ProductGrid from "@/components/product/ProductGrid";
import type { Category } from "@/types/category";
import type { Product, ProductPage } from "@/types/product";

async function loadHome() {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/v1/store/products?page_size=6&sort=newest`, { next: { revalidate: 60 } }),
      fetch(`${API_BASE_URL}/api/v1/store/categories`, { next: { revalidate: 60 } }),
    ]);
    const products: ProductPage = productsRes.ok ? await productsRes.json() : { items: [], page: 1, page_size: 6, total: 0, total_pages: 0 };
    const categories: Category[] = categoriesRes.ok ? await categoriesRes.json() : [];
    return { products: products.items ?? [], categories };
  } catch {
    return { products: [] as Product[], categories: [] as Category[] };
  }
}

export default async function HomePage() {
  const { products, categories } = await loadHome();

  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="store-container grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">FLOWAI Commerce</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Business technology, priced and stocked from the live catalog.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Browse published products, check real availability, and place test orders. Totals, tax, and inventory are calculated on the server.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
                Browse products
              </Link>
              <Link href="/login" className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50">
                Sign in
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(categories.length ? categories : [{ id: 0, name: "Catalog", slug: "products", description: "Published products" }]).slice(0, 4).map((category) => (
              <Link
                key={category.id || category.slug}
                href={category.id ? `/categories/${category.slug}` : "/products"}
                className="store-card p-5 hover:border-brand-200"
              >
                <p className="text-sm font-semibold text-slate-900">{category.name}</p>
                <p className="mt-1 text-sm text-slate-500">{category.description ?? "Shop this category"}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="store-container py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Featured products</h2>
            <p className="text-sm text-slate-500">Loaded from the database, not placeholder copy.</p>
          </div>
          <Link href="/products" className="text-sm font-medium text-brand-700 hover:underline">
            View all
          </Link>
        </div>
        <ProductGrid products={products} />
      </section>
    </main>
  );
}
