import { NextResponse } from "next/server";
import { readClientId } from "@/lib/client-id";
import { createAdminClient } from "@/lib/supabase/admin";
import { containsBannedKeywords } from "@/lib/moderation/text-filter";

type Params = { params: Promise<{ commentId: string }> };

/**
 * 소유권 판별: game_id가 없어서 comments의 edit_comment/delete_comment RPC 같은 원자적 카운터
 * 갱신이 필요 없다 — client_id 일치 여부를 update/delete의 필터 조건으로 직접 건다.
 */
export async function PATCH(request: Request, { params }: Params) {
  const clientId = await readClientId();
  if (!clientId) {
    return NextResponse.json({ error: "missing client id" }, { status: 400 });
  }

  const { commentId } = await params;
  const { content } = (await request.json()) as { content?: string };
  if (!content || content.trim().length === 0 || content.length > 300) {
    return NextResponse.json({ error: "invalid content" }, { status: 400 });
  }
  if (containsBannedKeywords(content).blocked) {
    return NextResponse.json({ error: "부적절한 표현이 포함되어 있어요." }, { status: 422 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("board_comments")
    .update({ content: content.trim() })
    .eq("id", commentId)
    .eq("client_id", clientId)
    .eq("status", "visible")
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "failed to update comment" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "comment not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const clientId = await readClientId();
  if (!clientId) {
    return NextResponse.json({ error: "missing client id" }, { status: 400 });
  }

  const { commentId } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("board_comments")
    .delete()
    .eq("id", commentId)
    .eq("client_id", clientId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "failed to delete comment" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "comment not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
