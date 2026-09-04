import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const protectedPath = request.nextUrl.pathname.startsWith("/account") || request.nextUrl.pathname.startsWith("/checkout") || request.nextUrl.pathname.startsWith("/support") || request.nextUrl.pathname === "/assistant";
  if (protectedPath && !request.cookies.get("flowai_access")) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/account/:path*", "/checkout/:path*", "/support/:path*", "/assistant"] };