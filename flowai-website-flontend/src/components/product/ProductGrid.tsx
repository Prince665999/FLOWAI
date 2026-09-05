import type { Product } from "@/types/product";
import ProductCard from "./ProductCard";
export default function ProductGrid({ products }: { products: Product[] }) { return products.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.map(product => <ProductCard key={product.id} product={product}/>)}</div> : <p>No products found.</p>; }
