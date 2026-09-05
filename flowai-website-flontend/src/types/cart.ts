export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price_amount: number;
  line_total_amount: number;
  name?: string | null;
  slug?: string | null;
  image_url?: string | null;
}

export interface Cart {
  id: number;
  status: string;
  items: CartItem[];
  subtotal_amount: number;
  currency: string;
}

export interface CheckoutQuote extends Cart {
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  shipping_address?: {
    id: number;
    full_name: string;
    line1: string;
    line2?: string | null;
    city: string;
    state?: string | null;
    postal_code?: string | null;
    country: string;
  } | null;
}
