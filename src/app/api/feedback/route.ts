import { NextResponse } from "next/server";
import { readClientId } from "@/lib/client-id";
import { createAdminClient } from "@/lib/supabase/admin";
import { containsBannedKeywords } from "@/lib/moderation/text-filter";
import { NICKNAME_MAX_LENGTH } from "@/lib/nickname";
import { POLICY } from "@/config/policy";

/**
 * 관리자에게만 보이는 비공개 건의/불편 제출. 신고(report)와 달리 특정 게임을 대상으로 하지
 * 않는 사이트 전반에 대한 피드백이라 별도 엔드포인트로 둔다.
 */
export async function POST(request: Request) {
  const clientId = await readClientId();
  if (!clientId) {
    return NextResponse.json({ error: "missing client id" }, { status: 400 });
  }

  const { content, nickname } = (await request.json()) as { content?: string; nickname?: string };
  if (!content || content.trim().length === 0 || content.length > 1000) {
    return NextResponse.json({ error: "invalid content" }, { status: 400 });
  }

  const trimmedNickname = nickname?.trim().slice(0, NICKNAME_MAX_LENGTH) || "익명";
  if (containsBannedKeywords(content).blocked || containsBannedKeywords(trimmedNickname).blocked) {
    return NextResponse.json({ error: "부적절한 표현이 포함되어 있어요." }, { status: 422 });
  }

  const supabase = createAdminClient();

  const todayStartIso = new Date(new Date().toISOString().slice(0, 10)).toISOString();
  const { count } = await supabase
    .from("feedback")
    .select("*", { count: "exact", head: true })
    .eq("client_id", clientId)
    .gte("created_at", todayStartIso);

  if ((count ?? 0) >= POLICY.FEEDBACK_MAX_PER_DAY) {
    return NextResponse.json({ error: "오늘 건의사항을 너무 많이 보냈어요. 내일 다시 시도해주세요." }, { status: 429 });
  }

  const { error } = await supabase.from("feedback").insert({
    client_id: clientId,
    nickname: trimmedNickname,
    content: content.trim(),
  });

  if (error) {
    return NextResponse.json({ error: "failed to submit feedback" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
