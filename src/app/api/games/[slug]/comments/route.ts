import { NextResponse } from "next/server";
import { readClientId } from "@/lib/client-id";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ slug: string }> };

export async function POST(request: Request, { params }: Params) {
  const clientId = await readClientId();
  if (!clientId) {
    return NextResponse.json({ error: "missing client id" }, { status: 400 });
  }

  const { slug } = await params;
  const { content } = (await request.json()) as { content?: string };
  if (!content || content.trim().length === 0 || content.length > 300) {
    return NextResponse.json({ error: "invalid content" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("add_comment", {
    p_slug: slug,
    p_client_id: clientId,
    p_content: content.trim(),
  });

  if (error) {
    return NextResponse.json({ error: "game not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
