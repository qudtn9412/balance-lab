import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ slug: string }> };

/** 신고 누적으로 자동 비공개(pending_review)된 게임을 검토 후 다시 공개한다. */
export async function POST(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("balance_games").update({ status: "published" }).eq("slug", slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
