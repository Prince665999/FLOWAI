import { NextRequest, NextResponse } from "next/server";

import { apiRequest } from "../../../../lib/backend";
import { setAuthCookies } from "../../../../lib/cookies";

const ACCESS_MAX_AGE = 60 * 60; // 1 hour
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const tokens = await apiRequest<{ access_token: string; refresh_token: string }>(
      "/api/v1/auth/login",
      {
        method: "POST",
        body,
      },
    );
    const response = NextResponse.json({ ok: true });
    return setAuthCookies(
      response,
      tokens.access_token,
      tokens.refresh_token,
      ACCESS_MAX_AGE,
      REFRESH_MAX_AGE,
    );
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ ok: false, detail }, { status: 401 });
  }
}