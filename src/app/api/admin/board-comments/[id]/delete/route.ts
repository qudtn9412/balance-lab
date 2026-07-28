import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("board_comments").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
