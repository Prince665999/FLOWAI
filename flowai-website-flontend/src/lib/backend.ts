/**
 * Server-side HTTP client used by Next.js route handlers to talk to the FastAPI
 * backend. The backend base URL is read server-side only (never serialized to
 * the browser); tokens are forwarded via Authorization headers derived from the
 * httpOnly cookies the browser already sent to us.
 */

export const API_BASE_URL =
  process.env.FLOWAI_API_URL ?? process.env.PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function toQueryString(params?: Record<string, unknown>): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    searchParams.append(key, String(value));
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export async function apiRequest<T = unknown>(
  path: string,
  init: Omit<RequestInit, "body"> & { params?: Record<string, unknown>; body?: unknown } = {},
): Promise<T> {
  const { params, headers, body, method, ...rest } = init;
  const response = await fetch(`${API_BASE_URL}${path}${toQueryString(params)}`, {
    ...rest,
    method: method ?? (body !== undefined ? "POST" : "GET"),
    headers: {
      "Content-Type": "application/json",
      ...(headers as Record<string, string> | undefined),
    },
    body: typeof body === "string" ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    let detail: unknown;
    try {
      detail = JSON.parse(text);
    } catch {
      detail = text;
    }
    const message =
      detail && typeof detail === "object" && "detail" in detail
        ? String((detail as { detail: unknown }).detail)
        : text || `Request failed (${response.status})`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}