import { NextRequest, NextResponse } from "next/server";

import { apiRequest } from "../../../../lib/backend";

export async function POST(req: NextRequest) {
  const { token, new_password: newPassword } = await req.json();
  try {
    await apiRequest("/api/v1/auth/password-reset/confirm", {
      method: "POST",
      body: { token, new_password: newPassword },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Reset failed";
    return NextResponse.json({ ok: false, detail }, { status: 400 });
  }
}