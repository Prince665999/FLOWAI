import { NextRequest, NextResponse } from "next/server";

import { API_BASE_URL } from "@/lib/backend";
import { readAuthCookies } from "@/lib/cookies";

async function proxy(request: NextRequest, context: { params: { path: string[] } }) {
  const path = context.params.path.join("/");
  const target = `${API_BASE_URL}/api/v1/${path}${request.nextUrl.search}`;
  const { accessToken } = readAuthCookies(request);

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const body =
    request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  for (const name of ["content-type", "cache-control"]) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
