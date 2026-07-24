import "server-only";
import { cookies } from "next/headers";

/**
 * 계정 시스템이 없는 서비스라 "관리자"라는 개념 자체가 없다. 신고 누적으로 자동 비공개된
 * 게임을 검토할 최소한의 방법으로, 공유 비밀번호(ADMIN_SECRET) 하나로만 게이팅하는
 * 임시 방편이다. 실제 운영자가 여럿이 되면 제대로 된 인증으로 교체해야 한다.
 */
export const ADMIN_COOKIE = "bg_admin";

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export async function isAdminAuthenticated(): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === secret;
}
