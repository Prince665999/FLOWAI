"use client";

import { useCallback, useEffect, useState } from "react";

import {
  forgotPassword as apiForgotPassword,
  getMe,
  login as apiLogin,
  logout as apiLogout,
  refreshSession,
  register as apiRegister,
  resetPassword as apiResetPassword,
} from "@/api/auth";
import type { AuthResult, LoginPayload, RegisterPayload, User } from "@/types/user";

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthResult>;
  register: (payload: RegisterPayload) => Promise<AuthResult>;
  logout: () => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResult>;
  reload: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const current = await getMe();
    setUser(current);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await apiLogin(payload);
    if (result.ok) {
      await reload();
    }
    return result;
  }, [reload]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await apiRegister(payload);
    if (result.ok) {
      await reload();
    }
    return result;
  }, [reload]);

  const logout = useCallback(async () => {
    const result = await apiLogout();
    setUser(null);
    return result;
  }, []);

  const forgotPassword = useCallback((email: string) => apiForgotPassword(email), []);
  const resetPassword = useCallback(
    (token: string, newPassword: string) => apiResetPassword(token, newPassword),
    [],
  );

  return {
    user,
    loading,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    reload,
  };
}

export const useAuthRefresh = refreshSession;
export type { AuthResult } from "@/types/user";
