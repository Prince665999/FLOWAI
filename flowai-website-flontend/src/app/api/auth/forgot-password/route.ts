import { NextRequest, NextResponse } from "next/server";

import { apiRequest } from "../../../../lib/backend";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  try {
    const result = await apiRequest<{ detail: string }>("/api/v1/auth/password-reset/request", {
      method: "POST",
      body: { email },
    });
    return NextResponse.json({ ok: true, detail: result.detail });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ ok: false, detail }, { status: 400 });
  }
}