import ProductGrid from "@/components/product/ProductGrid";
import { API_BASE_URL } from "@/lib/backend";
import type { Product } from "@/types/product";
async function products(): Promise<Product[]> { const response=await fetch(`${API_BASE_URL}/api/v1/store/products`,{next:{revalidate:60}}); if(!response.ok)return []; const data=await response.json(); return data.items ?? data; }
export default async function ProductsPage(){const items=await products();return <main className="mx-auto max-w-6xl px-6 py-12"><h1 className="text-3xl font-bold">Products</h1><p className="mt-2 text-slate-600">Browse business technology and office equipment.</p><div className="mt-8"><ProductGrid products={items}/></div></main>}
