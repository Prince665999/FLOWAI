import Link from "next/link";

export default function NotFound() {
  return (
    <main className="store-container py-20 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-slate-500">That product or page is not in the catalog.</p>
      <Link href="/products" className="mt-6 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">
        Browse products
      </Link>
    </main>
  );
}
