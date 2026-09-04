import { NextRequest, NextResponse } from "next/server";

import { apiRequest } from "../../../../lib/backend";
import { readAuthCookies, setAuthCookies } from "../../../../lib/cookies";

const ACCESS_MAX_AGE = 60 * 60;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(req: NextRequest) {
  const { refreshToken } = readAuthCookies(req);
  if (!refreshToken) {
    return NextResponse.json({ ok: false, detail: "No session" }, { status: 401 });
  }

  try {
    const tokens = await apiRequest<{ access_token: string; refresh_token: string }>(
      "/api/v1/auth/refresh",
      { method: "POST", body: { refresh_token: refreshToken } },
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
    const detail = error instanceof Error ? error.message : "Session expired";
    return NextResponse.json({ ok: false, detail }, { status: 401 });
  }
}