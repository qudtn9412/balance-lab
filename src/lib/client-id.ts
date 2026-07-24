import { randomUUID } from "crypto";
import { cookies } from "next/headers";

export const CLIENT_ID_COOKIE = "bg_cid";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** 새 익명 client_id 값을 발급한다 (쿠키에 담는 것은 호출부 책임). */
export function issueClientId(): string {
  return randomUUID();
}

export const CLIENT_ID_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: ONE_YEAR_SECONDS,
};

/**
 * Route Handler / Server Component에서 현재 요청의 client_id를 읽는다.
 * proxy.ts가 모든 요청에 대해 쿠키 발급을 보장하므로, 여기서 없으면 비정상 상황(직접 API 호출 등)이다.
 */
export async function readClientId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CLIENT_ID_COOKIE)?.value ?? null;
}
