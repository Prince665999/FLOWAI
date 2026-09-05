"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, Search, ShoppingBag, UserRound } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useCartUiStore } from "@/store/cartUiStore";

import MobileMenu from "./MobileMenu";
import NavBar from "./NavBar";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const openDrawer = useCartUiStore((state) => state.openDrawer);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="store-container flex items-center gap-4 py-3">
        <Link href="/" className="shrink-0">
          <span className="text-lg font-bold tracking-tight text-slate-900">FLOWAI</span>
          <span className="ml-1 text-sm font-medium text-brand-600">Store</span>
        </Link>

        <div className="hidden flex-1 md:block">
          <form
            className="relative max-w-xl"
            onSubmit={(event) => {
              event.preventDefault();
              router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/products");
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search laptops, monitors, printers..."
              className="w-full rounded-full border border-slate-300 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
            />
          </form>
        </div>

        <div className="hidden md:block">
          <NavBar />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={openDrawer}
            className="relative rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 rounded-full bg-brand-600 px-1.5 text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            ) : null}
          </button>

          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/account/orders" className="rounded-lg p-2 text-slate-700 hover:bg-slate-100">
                <UserRound className="h-5 w-5" />
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/login" className="hidden rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white sm:inline">
              Sign in
            </Link>
          )}

          <button type="button" className="rounded-lg p-2 md:hidden" onClick={() => setMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
