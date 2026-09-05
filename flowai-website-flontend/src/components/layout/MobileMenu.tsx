"use client";

import Link from "next/link";

import NavBar from "./NavBar";

export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/40 md:hidden" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-72 bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="mb-4 text-sm font-semibold text-slate-500">Menu</p>
        <NavBar onNavigate={onClose} />
        <div className="mt-6 space-y-2 text-sm">
          <Link href="/account/orders" onClick={onClose} className="block rounded-lg px-3 py-2 hover:bg-slate-100">
            Orders
          </Link>
          <Link href="/account/addresses" onClick={onClose} className="block rounded-lg px-3 py-2 hover:bg-slate-100">
            Addresses
          </Link>
          <Link href="/cart" onClick={onClose} className="block rounded-lg px-3 py-2 hover:bg-slate-100">
            Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
