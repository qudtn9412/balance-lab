import { NextResponse } from "next/server";
import { readClientId } from "@/lib/client-id";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ slug: string; commentId: string }> };

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

  const supabase = createAdminClient();
  const { data: updated, error } = await supabase.rpc("edit_comment", {
    p_comment_id: commentId,
    p_client_id: clientId,
    p_content: content.trim(),
  });

  if (error) {
    return NextResponse.json({ error: "failed to update comment" }, { status: 500 });
  }
  if (!updated) {
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
  const { data: deleted, error } = await supabase.rpc("delete_comment", {
    p_comment_id: commentId,
    p_client_id: clientId,
  });

  if (error) {
    return NextResponse.json({ error: "failed to delete comment" }, { status: 500 });
  }
  if (!deleted) {
    return NextResponse.json({ error: "comment not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
