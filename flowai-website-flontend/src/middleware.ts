import { NextRequest, NextResponse } from "next/server";

import { ACCESS_COOKIE } from "./lib/cookies";

// Routes that every authenticated customer must be signed in to reach.
const PROTECTED_PREFIXES = ["/(customer)"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsAuth = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!needsAuth) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.get(ACCESS_COOKIE)?.value !== undefined;
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};