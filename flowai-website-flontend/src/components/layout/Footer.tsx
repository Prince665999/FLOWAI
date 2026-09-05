import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="store-container grid gap-8 py-10 sm:grid-cols-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">FLOWAI Store</p>
          <p className="mt-2 text-sm text-slate-500">
            Business technology and office equipment, with catalog prices and inventory from the FLOWAI backend.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-slate-900">Shop</p>
          <div className="mt-2 flex flex-col gap-1 text-slate-600">
            <Link href="/products">All products</Link>
            <Link href="/categories/laptops">Laptops</Link>
            <Link href="/categories/monitors">Monitors</Link>
            <Link href="/search">Search</Link>
          </div>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-slate-900">Account</p>
          <div className="mt-2 flex flex-col gap-1 text-slate-600">
            <Link href="/account/orders">Orders</Link>
            <Link href="/support">Support</Link>
            <Link href="/assistant">AI assistant</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
