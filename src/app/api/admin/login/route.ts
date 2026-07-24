import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_COOKIE_OPTIONS } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { secret } = (await request.json().catch(() => ({}))) as { secret?: string };
  const expected = process.env.ADMIN_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, expected, ADMIN_COOKIE_OPTIONS);
  return response;
}
