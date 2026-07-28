import { NextResponse } from "next/server";
import { readClientId } from "@/lib/client-id";
import { createAdminClient } from "@/lib/supabase/admin";
import { containsBannedKeywords } from "@/lib/moderation/text-filter";
import { NICKNAME_MAX_LENGTH } from "@/lib/nickname";

/** 소통게시판 글 작성. 특정 게임에 안 묶인 독립 스트림이라 slug 조회 없이 바로 insert한다. */
export async function POST(request: Request) {
  const clientId = await readClientId();
  if (!clientId) {
    return NextResponse.json({ error: "missing client id" }, { status: 400 });
  }

  const { content, nickname } = (await request.json()) as { content?: string; nickname?: string };
  if (!content || content.trim().length === 0 || content.length > 300) {
    return NextResponse.json({ error: "invalid content" }, { status: 400 });
  }

  const trimmedNickname = nickname?.trim().slice(0, NICKNAME_MAX_LENGTH) || "익명";
  if (containsBannedKeywords(content).blocked || containsBannedKeywords(trimmedNickname).blocked) {
    return NextResponse.json({ error: "부적절한 표현이 포함되어 있어요." }, { status: 422 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("board_comments")
    .insert({ client_id: clientId, content: content.trim(), nickname: trimmedNickname })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "failed to post" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}
