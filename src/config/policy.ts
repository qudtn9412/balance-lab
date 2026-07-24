/**
 * 서비스 운영 정책 상수.
 * 값 자체를 바꾸는 것만으로 정책을 조정할 수 있도록 로직과 분리해서 관리한다.
 */
export const POLICY = {
  /** client_id당 하루 무료 이미지 생성 장수 */
  FREE_GENERATIONS_PER_DAY: 2,
  /**
   * IP당 하루 이미지 생성 상한 (client_id 쿠키 초기화로 개인 한도를 우회하는 것을 막는 안전망).
   * 사무실/가정 등 공유 IP의 정상 사용자를 막지 않도록 개인 한도보다 넉넉하게 잡는다.
   */
  IP_DAILY_GENERATION_CAP: 50,
  /** 리워드 광고 시청 1회당 지급되는 추가 생성 장수 */
  BONUS_GENERATIONS_PER_AD: 1,
  /** client_id당 하루 리워드 광고 시청 가능 횟수 상한 */
  MAX_REWARD_ADS_PER_DAY: 5,
  /** 랭킹 노출에 필요한 최소 투표수 (표본 부족으로 인한 왜곡 방지) */
  RANKING_MIN_VOTES: 20,
  /** 신고 누적 시 자동 비공개 처리되는 임계치 */
  AUTO_HIDE_REPORT_THRESHOLD: 5,
} as const;
