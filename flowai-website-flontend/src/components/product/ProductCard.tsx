import Link from "next/link";
import type { Product } from "@/types/product";
import PriceTag from "./PriceTag";
export default function ProductCard({ product }: { product: Product }) { return <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><Link href={`/products/${product.slug}`}><h2 className="font-semibold">{product.name}</h2><p className="text-sm text-slate-500">{product.short_description}</p><PriceTag amount={product.price_amount} currency={product.currency}/><p className="text-xs">{product.available_quantity > 0 ? "In stock" : "Out of stock"}</p></Link></article>; }
