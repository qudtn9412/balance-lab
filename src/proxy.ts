import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import {
  CLIENT_ID_COOKIE,
  CLIENT_ID_COOKIE_OPTIONS,
  issueClientId,
} from "@/lib/client-id";
import { recordVisit } from "@/lib/track-visit";

const LAST_VISIT_COOKIE = "bg_lv";

/**
 * 회원가입 없이 모든 방문자를 익명 client_id로 식별하기 위한 진입점.
 * 쿠키가 없으면 새로 발급한다. 이 값이 투표/댓글/생성 한도의 유일한 사용자 식별자이므로
 * 여기서 빠짐없이 부여되어야 한다 (그렇지 않으면 API에서 client_id 없이 요청이 들어올 수 있음).
 *
 * "오늘 방문자수" 집계도 여기서 같이 처리한다. bg_lv 쿠키(오늘 날짜)가 없거나 오늘 날짜가
 * 아니면 방문 기록을 남기고 갱신한다 — 매 요청마다 DB에 쓰지 않고 방문자당 하루 1번만 쓴다.
 * event.waitUntil로 응답을 막지 않고 백그라운드에서 기록한다.
 */
export function proxy(request: NextRequest, event: NextFetchEvent) {
  const existing = request.cookies.get(CLIENT_ID_COOKIE)?.value;
  const clientId = existing ?? issueClientId();
  const today = new Date().toISOString().slice(0, 10);
  const lastVisit = request.cookies.get(LAST_VISIT_COOKIE)?.value;

  const response = NextResponse.next();
  if (!existing) {
    response.cookies.set(CLIENT_ID_COOKIE, clientId, CLIENT_ID_COOKIE_OPTIONS);
  }
  if (lastVisit !== today) {
    response.cookies.set(LAST_VISIT_COOKIE, today, { ...CLIENT_ID_COOKIE_OPTIONS, httpOnly: false, maxAge: 60 * 60 * 24 * 2 });
    event.waitUntil(recordVisit(clientId, today));
  }

  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
