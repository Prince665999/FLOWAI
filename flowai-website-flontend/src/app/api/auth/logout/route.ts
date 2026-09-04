import { NextRequest, NextResponse } from "next/server";

import { apiRequest } from "../../../../lib/backend";
import { clearAuthCookies, readAuthCookies } from "../../../../lib/cookies";

export async function POST(req: NextRequest) {
  const { accessToken, refreshToken } = readAuthCookies(req);

  if (accessToken && refreshToken) {
    try {
      await apiRequest("/api/v1/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: { refresh_token: refreshToken },
      });
    } catch {
      // Even if the backend already considers the token invalid, we still clear
      // the client-side session.
    }
  }

  return clearAuthCookies(NextResponse.json({ ok: true }));
}