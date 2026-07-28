/**
 * 서비스 운영 정책 상수.
 * 값 자체를 바꾸는 것만으로 정책을 조정할 수 있도록 로직과 분리해서 관리한다.
 */
export const POLICY = {
  /** client_id당 하루 무료 이미지 생성 장수 */
  FREE_GENERATIONS_PER_DAY: 2,
  /**
   * IP당 하루 이미지 생성 상한 (client_id 쿠키 초기화로 개인 한도를 우회하는 것을 막는 안전망).
   * Cloudflare Workers AI 무료 뉴런 한도(하루 10k)가 계정 전체 공유 한도라 개인당 한도를
   * 넉넉하게 열어두면 소수의 어뷰징만으로도 전체 무료 한도가 금방 소진될 수 있어,
   * 공유 IP 환경(사무실 등)을 다소 희생하더라도 낮게(10) 잡는다.
   */
  IP_DAILY_GENERATION_CAP: 10,
  /**
   * 리워드 광고 시청 1회당 지급되는 추가 생성 장수. 밸런스게임 1개 = 이미지 2장이라
   * 광고 1번으로 게임 하나를 완성할 수 있게 2장을 지급한다 (광고를 2번 보게 하면 원가 대비
   * 마진은 더 커지지만, 이 서비스의 핵심 원칙인 저마찰 참여 구조를 해치므로 채택하지 않았다).
   */
  BONUS_GENERATIONS_PER_AD: 2,
  /** client_id당 하루 리워드 광고 시청 가능 횟수 상한 */
  MAX_REWARD_ADS_PER_DAY: 5,
  /** 랭킹 노출에 필요한 최소 투표수 (표본 부족으로 인한 왜곡 방지) */
  RANKING_MIN_VOTES: 20,
  /** 신고 누적 시 자동 비공개 처리되는 임계치 */
  AUTO_HIDE_REPORT_THRESHOLD: 5,
  /** client_id당 하루 건의/불편 게시판 제출 가능 횟수 (도배 방지용 상한) */
  FEEDBACK_MAX_PER_DAY: 10,
} as const;
