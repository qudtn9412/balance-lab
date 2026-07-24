import { NextResponse } from "next/server";
import { readClientId } from "@/lib/client-id";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ slug: string }> };

/**
 * 좋아요 토글. votes와 달리 다시 눌러 취소할 수 있다.
 * 카운트 증감은 Postgres 함수(toggle_like)에서 원자적으로 처리한다.
 */
export async function POST(request: Request, { params }: Params) {
  const clientId = await readClientId();
  if (!clientId) {
    return NextResponse.json({ error: "missing client id" }, { status: 400 });
  }

  const { slug } = await params;

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("toggle_like", {
    p_slug: slug,
    p_client_id: clientId,
  });

  if (error) {
    return NextResponse.json({ error: "game not found" }, { status: 404 });
  }

  return NextResponse.json({ liked: data });
}
