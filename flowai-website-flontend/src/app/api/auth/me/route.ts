import { NextRequest, NextResponse } from "next/server";

import { apiRequest } from "../../../../lib/backend";
import { readAuthCookies } from "../../../../lib/cookies";

import type { User } from "@/types/user";

export async function GET(req: NextRequest) {
  const { accessToken } = readAuthCookies(req);
  if (!accessToken) {
    return NextResponse.json({ ok: false, detail: "Unauthenticated" }, { status: 401 });
  }

  try {
    const user = await apiRequest<User>("/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json({ ok: false, detail: "Invalid session" }, { status: 401 });
  }
}