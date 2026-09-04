import Link from "next/link";

export default function HomePage() {
  return (
    <main className="px-6 py-16 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900">Welcome to FLOWAI Store</h1>
      <p className="mt-3 text-slate-600">
        Business technology and office equipment for teams. Full catalogue and
        checkout arrive in the next phases.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/products"
          className="rounded-md bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
        >
          Browse products
        </Link>
        <Link
          href="/login"
          className="rounded-md border px-4 py-2 text-slate-700 hover:bg-slate-100"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
