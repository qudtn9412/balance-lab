import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * "오늘 방문자수"는 이 서비스의 다른 통계(생성/광고 등)와 달리 페이지뷰 자체를 봐야 하는데,
 * 이미지 생성을 안 한 방문자는 generation_usage에 안 잡힌다. 그렇다고 GA를 새로 붙이는 대신,
 * 어차피 모든 요청에 발급되는 client_id 쿠키를 그대로 활용해 하루 1번만 기록한다
 * (proxy.ts가 방문자별로 하루에 한 번만 호출하도록 게이팅한다).
 */
export async function recordVisit(clientId: string, visitDate: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("site_visits").upsert(
      { client_id: clientId, visit_date: visitDate },
      { onConflict: "client_id,visit_date", ignoreDuplicates: true },
    );
  } catch {
    // 방문 집계 실패가 실제 요청을 막으면 안 된다.
  }
}
