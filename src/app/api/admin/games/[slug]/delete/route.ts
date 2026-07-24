import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteImageFromR2 } from "@/lib/storage/r2";

type Params = { params: Promise<{ slug: string }> };

/** 검토 후 완전히 삭제. DB 행과 R2에 올라간 이미지 2장을 함께 정리해 고아 오브젝트를 남기지 않는다. */
export async function POST(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: game, error: fetchError } = await supabase
    .from("balance_games")
    .select("option_a_image_url, option_b_image_url")
    .eq("slug", slug)
    .single();

  if (fetchError || !game) {
    return NextResponse.json({ error: "game not found" }, { status: 404 });
  }

  await Promise.all([
    deleteImageFromR2(game.option_a_image_url),
    deleteImageFromR2(game.option_b_image_url),
  ]);

  const { error: deleteError } = await supabase.from("balance_games").delete().eq("slug", slug);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
