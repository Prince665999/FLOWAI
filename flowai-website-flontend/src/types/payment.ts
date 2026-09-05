export interface Payment {
  id: number;
  order_id: number;
  provider: string;
  status: string;
  amount: number;
  currency: string;
}
