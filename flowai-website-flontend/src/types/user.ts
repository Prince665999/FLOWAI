export type AccountType = "customer" | "staff";
export type RoleName = "customer" | "employee" | "manager" | "admin";

export interface User {
  id: number;
  email: string;
  full_name: string;
  account_type: AccountType;
  role_name: RoleName;
  is_active: boolean;
  is_superuser: boolean;
  email_verified_at: string | null;
  customer_id: number | null;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  account_type?: AccountType;
}

export interface AuthResult {
  ok: boolean;
  user?: User;
  detail?: string;
}
