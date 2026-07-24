import { NextResponse } from "next/server";
import { readClientId } from "@/lib/client-id";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ slug: string }> };

/**
 * 투표. votes 테이블의 unique(game_id, voter_client_id) 제약이 중복 투표를 막고,
 * 득표 카운트 증가는 Postgres 함수(cast_vote)에서 원자적으로 처리한다.
 */
export async function POST(request: Request, { params }: Params) {
  const clientId = await readClientId();
  if (!clientId) {
    return NextResponse.json({ error: "missing client id" }, { status: 400 });
  }

  const { slug } = await params;
  const { choice } = (await request.json()) as { choice?: "a" | "b" };
  if (choice !== "a" && choice !== "b") {
    return NextResponse.json({ error: "invalid choice" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("cast_vote", {
    p_slug: slug,
    p_voter_client_id: clientId,
    p_choice: choice,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "already voted" }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
