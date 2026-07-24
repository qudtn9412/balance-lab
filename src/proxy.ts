import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  CLIENT_ID_COOKIE,
  CLIENT_ID_COOKIE_OPTIONS,
  issueClientId,
} from "@/lib/client-id";

/**
 * 회원가입 없이 모든 방문자를 익명 client_id로 식별하기 위한 진입점.
 * 쿠키가 없으면 새로 발급한다. 이 값이 투표/댓글/생성 한도의 유일한 사용자 식별자이므로
 * 여기서 빠짐없이 부여되어야 한다 (그렇지 않으면 API에서 client_id 없이 요청이 들어올 수 있음).
 */
export function proxy(request: NextRequest) {
  const existing = request.cookies.get(CLIENT_ID_COOKIE)?.value;
  if (existing) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.cookies.set(CLIENT_ID_COOKIE, issueClientId(), CLIENT_ID_COOKIE_OPTIONS);
  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
