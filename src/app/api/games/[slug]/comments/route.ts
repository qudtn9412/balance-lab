import { NextResponse } from "next/server";
import { readClientId } from "@/lib/client-id";
import { createAdminClient } from "@/lib/supabase/admin";
import { NICKNAME_MAX_LENGTH } from "@/lib/nickname";
import { containsBannedKeywords } from "@/lib/moderation/text-filter";

type Params = { params: Promise<{ slug: string }> };

export async function POST(request: Request, { params }: Params) {
  const clientId = await readClientId();
  if (!clientId) {
    return NextResponse.json({ error: "missing client id" }, { status: 400 });
  }

  const { slug } = await params;
  const { content, nickname } = (await request.json()) as { content?: string; nickname?: string };
  if (!content || content.trim().length === 0 || content.length > 300) {
    return NextResponse.json({ error: "invalid content" }, { status: 400 });
  }

  const trimmedNickname = nickname?.trim().slice(0, NICKNAME_MAX_LENGTH) || "익명";
  if (containsBannedKeywords(content).blocked || containsBannedKeywords(trimmedNickname).blocked) {
    return NextResponse.json({ error: "댓글 또는 닉네임에 부적절한 표현이 포함되어 있어요." }, { status: 422 });
  }

  const supabase = createAdminClient();
  const { data: commentId, error } = await supabase.rpc("add_comment", {
    p_slug: slug,
    p_client_id: clientId,
    p_content: content.trim(),
    p_nickname: trimmedNickname,
  });

  if (error) {
    return NextResponse.json({ error: "game not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, id: commentId }, { status: 201 });
}
