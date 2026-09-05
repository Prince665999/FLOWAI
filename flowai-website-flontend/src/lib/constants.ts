export const PAGE_SIZE = 12;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "fulfilled",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const NAV_LINKS = [
  { href: "/products", label: "Catalog" },
  { href: "/search", label: "Search" },
  { href: "/assistant", label: "Assistant" },
  { href: "/support", label: "Support" },
] as const;
