import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

/** 건의 제출자에게 보여줄 관리자 답변을 저장한다. */
export async function POST(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { reply } = (await request.json()) as { reply?: string };
  const trimmed = reply?.trim() ?? "";
  if (trimmed.length > 1000) {
    return NextResponse.json({ error: "invalid reply" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("feedback")
    .update({ admin_reply: trimmed || null })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
