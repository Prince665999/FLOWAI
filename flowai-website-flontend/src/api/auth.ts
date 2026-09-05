import { apiClient, AUTH_PATH } from "./client";
import type {
  AuthResult,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types/user";

async function toAuthResult(promise: Promise<unknown>): Promise<AuthResult> {
  try {
    await promise;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      detail: error instanceof Error ? error.message : "Request failed",
    };
  }
}

export async function login(payload: LoginPayload): Promise<AuthResult> {
  return toAuthResult(apiClient.post(`${AUTH_PATH}/login`, payload));
}

export async function register(payload: RegisterPayload): Promise<AuthResult> {
  return toAuthResult(apiClient.post(`${AUTH_PATH}/register`, payload));
}

export async function logout(): Promise<AuthResult> {
  return toAuthResult(apiClient.post(`${AUTH_PATH}/logout`));
}

export async function refreshSession(): Promise<AuthResult> {
  return toAuthResult(apiClient.post(`${AUTH_PATH}/refresh`));
}

export async function getMe(): Promise<User | null> {
  try {
    const payload = await apiClient.get<{ ok: boolean; user?: User }>(`${AUTH_PATH}/me`);
    return payload.user ?? null;
  } catch {
    return null;
  }
}

export async function forgotPassword(email: string): Promise<AuthResult> {
  return toAuthResult(apiClient.post(`${AUTH_PATH}/forgot-password`, { email }));
}

export async function resetPassword(token: string, newPassword: string): Promise<AuthResult> {
  return toAuthResult(
    apiClient.post(`${AUTH_PATH}/reset-password`, {
      token,
      new_password: newPassword,
    }),
  );
}
