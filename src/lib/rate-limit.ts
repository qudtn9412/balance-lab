import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { POLICY } from "@/config/policy";

/**
 * 오늘 남은 무료 생성권(기본 한도 + 리워드 보너스)이 있으면 1장 소비하고 true를 반환한다.
 * 실제 증감은 Postgres 함수(consume_generation_credit)에서 원자적으로 처리한다 —
 * 여기서 read-then-write를 하면 동시 요청 시 한도를 초과 소비할 수 있기 때문.
 * client_id 한도와 별개로 IP 단위 하루 상한(POLICY.IP_DAILY_GENERATION_CAP)도 같이 검사해서,
 * 쿠키를 지워 client_id를 새로 발급받는 방식의 우회를 막는다.
 */
export async function tryConsumeGenerationCredit(clientId: string, ipAddress: string): Promise<boolean> {
  if (process.env.NODE_ENV !== "production") {
    // 로컬 개발 중에는 아직 회원가입/관리자 개념이 없어 사람과 트래픽을 구분할 수 없다.
    // 실제 사용자 트래픽이 없는 로컬 테스트 환경이므로 한도 집계 자체를 건너뛴다.
    // 프로덕션 배포본에서는 이 분기가 적용되지 않고 정상적으로 한도가 집계/차단된다.
    return true;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("consume_generation_credit", {
    p_client_id: clientId,
    p_free_limit: POLICY.FREE_GENERATIONS_PER_DAY,
    p_ip_address: ipAddress,
    p_ip_daily_cap: POLICY.IP_DAILY_GENERATION_CAP,
  });

  if (error) {
    throw new Error(`generation credit check failed: ${error.message}`);
  }

  return Boolean(data);
}

/**
 * 리워드 광고 시청 완료 콜백에서 호출. 하루 시청 상한 내에서만 보너스 생성권을 지급한다.
 */
export async function tryGrantRewardCredit(clientId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("grant_reward_credit", {
    p_client_id: clientId,
    p_max_ads_per_day: POLICY.MAX_REWARD_ADS_PER_DAY,
    p_bonus_per_ad: POLICY.BONUS_GENERATIONS_PER_AD,
  });

  if (error) {
    throw new Error(`reward credit grant failed: ${error.message}`);
  }

  return Boolean(data);
}
