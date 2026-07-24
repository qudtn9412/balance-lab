import { randomBytes } from "crypto";

/** 공유 URL에 쓰이는 짧은 무작위 slug (예: /games/x7fk2p9a). */
export function generateSlug(): string {
  return randomBytes(6).toString("base64url");
}
