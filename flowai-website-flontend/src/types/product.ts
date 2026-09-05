export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description?: string | null;
  short_description?: string | null;
  brand?: string | null;
  category_id?: number | null;
  price_amount: number;
  currency: string;
  image_url?: string | null;
  specifications: Record<string, unknown>;
  available_quantity: number;
}

export interface ProductPage {
  items: Product[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface ProductQuery {
  search?: string;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  brand?: string;
  is_available?: boolean;
  page?: number;
  page_size?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "name";
}
