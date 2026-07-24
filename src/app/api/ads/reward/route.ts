import { NextResponse } from "next/server";
import { readClientId } from "@/lib/client-id";
import { tryGrantRewardCredit } from "@/lib/rate-limit";

/**
 * 리워드 광고 시청 완료 콜백. 광고 SDK가 시청 완료를 서버에 알리는 지점이며,
 * 클라이언트가 "시청했다"고 우기는 값을 그대로 믿지 않도록 이 엔드포인트에서
 * 하루 시청 상한을 다시 한번 서버 측에서 검증한다 (tryGrantRewardCredit).
 */
export async function POST() {
  const clientId = await readClientId();
  if (!clientId) {
    return NextResponse.json({ error: "missing client id" }, { status: 400 });
  }

  const granted = await tryGrantRewardCredit(clientId);
  if (!granted) {
    return NextResponse.json({ error: "daily ad view limit reached" }, { status: 429 });
  }

  return NextResponse.json({ ok: true });
}
