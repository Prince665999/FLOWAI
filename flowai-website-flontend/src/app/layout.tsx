import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FLOWAI Store",
  description: "Business technology and office equipment, served by FLOWAI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
