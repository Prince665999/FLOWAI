import type { Metadata } from "next";

import CartDrawer from "@/components/cart/CartDrawer";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "FLOWAI Store",
  description: "Business technology and office equipment, served by FLOWAI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col text-slate-900">
        <Providers>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
