import { NextResponse } from "next/server";
import { readClientId } from "@/lib/client-id";
import { createAdminClient } from "@/lib/supabase/admin";
import { POLICY } from "@/config/policy";

type Params = { params: Promise<{ slug: string }> };

/**
 * 게임 신고. 신고 누적이 임계치를 넘으면 즉시 비공개 처리한다 (submit_report_and_maybe_hide 함수).
 * 사람이 검수하기 전까지 노출을 막는 1차 방어선이며, 오남용(집단 신고로 정상 콘텐츠 내리기)
 * 가능성은 향후 신고 사유 검토 프로세스로 보완이 필요하다.
 */
export async function POST(request: Request, { params }: Params) {
  const clientId = await readClientId();
  if (!clientId) {
    return NextResponse.json({ error: "missing client id" }, { status: 400 });
  }

  const { slug } = await params;
  const { reason } = (await request.json().catch(() => ({}))) as { reason?: string };

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("submit_report_and_maybe_hide", {
    p_slug: slug,
    p_reporter_client_id: clientId,
    // Postgres 함수 파라미터는 컬럼과 달리 생성된 타입에 nullable 여부가 반영되지 않아
    // string으로만 잡힌다 — reports.reason 컬럼 자체는 nullable이라 null 전달이 유효하다.
    p_reason: (reason ?? null) as string,
    p_auto_hide_threshold: POLICY.AUTO_HIDE_REPORT_THRESHOLD,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
