import "server-only";

/**
 * 실존 인물(연예인 등) 특정 지칭 프롬프트를 이름 기반으로 차단한다.
 * TODO: 지금은 예시 삼아 널리 알려진 이름 몇 개만 넣어뒀다. 실제 운영 전에는
 * 훨씬 큰 인물명 데이터베이스(연예인/정치인/스포츠 스타 등)로 교체해야 한다 —
 * 여기 목록은 로직이 실제로 동작함을 보여주는 골격이며, 완전한 목록이 아니다.
 * text-filter.ts의 일반 금칙어 필터와 별도로 두는 이유: 초상권/명예훼손 리스크는
 * "위해 콘텐츠"가 아니라 "특정 실존 인물 지칭" 자체가 문제라 판단 기준이 다르기 때문이다.
 */
const REAL_PERSON_PATTERNS = [
  /손흥민/,
  /BTS|방탄소년단/i,
  /블랙핑크|blackpink/i,
  /아이유/,
  /뉴진스|newjeans/i,
  /임영웅/,
];

export async function containsRealPersonReference(prompt: string): Promise<boolean> {
  return REAL_PERSON_PATTERNS.some((pattern) => pattern.test(prompt));
}
