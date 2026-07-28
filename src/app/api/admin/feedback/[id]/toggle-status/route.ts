import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

/** open <-> resolved 토글. */
export async function POST(_request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: row } = await supabase.from("feedback").select("status").eq("id", id).single();
  if (!row) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const nextStatus = row.status === "resolved" ? "open" : "resolved";
  const { error } = await supabase.from("feedback").update({ status: nextStatus }).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: nextStatus });
}
