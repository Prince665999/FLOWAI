import type { NextResponse } from "next/server";

export const ACCESS_COOKIE = process.env.FLOWAI_ACCESS_COOKIE ?? "flowai_access";
export const REFRESH_COOKIE = process.env.FLOWAI_REFRESH_COOKIE ?? "flowai_refresh";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  accessMaxAge: number,
  refreshMaxAge: number,
): NextResponse {
  response.cookies.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PRODUCTION,
    path: "/",
    maxAge: accessMaxAge,
  });
  response.cookies.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PRODUCTION,
    path: "/",
    maxAge: refreshMaxAge,
  });
  return response;
}

export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.set(ACCESS_COOKIE, "", {
    httpOnly: true,
    secure: IS_PRODUCTION,
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(REFRESH_COOKIE, "", {
    httpOnly: true,
    secure: IS_PRODUCTION,
    path: "/",
    maxAge: 0,
  });
  return response;
}

export function readAuthCookies(req: {
  cookies: { get: (name: string) => { value: string } | undefined };
}) {
  return {
    accessToken: req.cookies.get(ACCESS_COOKIE)?.value,
    refreshToken: req.cookies.get(REFRESH_COOKIE)?.value,
  };
}
