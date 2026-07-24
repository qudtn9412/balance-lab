/**
 * "가장 어려운 밸런스" 랭킹용 스코어 계산.
 *
 * 단순 |votesA - votesB| 비율만 보면 표본이 적을 때 왜곡된다
 * (예: 1:1 투표는 득표율이 정확히 50:50이지만 우연일 수 있다).
 * 그래서 다수표 쪽 비율에 대한 Wilson score 구간의 상한을 구해서,
 * "표본을 감안해도 여전히 50:50에 가깝다고 확신할 수 있는가"를 점수화한다.
 *
 * 상한이 0.5에 가까울수록(=표본이 많아도 확실히 반반) 점수가 높다.
 * 이 공식은 초기안이며, 실제 서비스 데이터로 튜닝될 수 있다.
 */

const DEFAULT_Z = 1.96; // 95% 신뢰수준

function wilsonUpperBound(positive: number, total: number, z: number = DEFAULT_Z): number {
  if (total === 0) return 1;
  const phat = positive / total;
  const z2 = z * z;
  const denominator = 1 + z2 / total;
  const center = phat + z2 / (2 * total);
  const margin = z * Math.sqrt((phat * (1 - phat) + z2 / (4 * total)) / total);
  return (center + margin) / denominator;
}

/**
 * @returns 0~1 사이 점수 (1에 가까울수록 "확실하게 반반"). 최소 투표수 미만이면 null.
 */
export function computeBalanceScore(
  votesA: number,
  votesB: number,
  minVotes: number,
): number | null {
  const total = votesA + votesB;
  if (total < minVotes) return null;

  const majority = Math.max(votesA, votesB);
  const upperBound = wilsonUpperBound(majority, total);

  // upperBound는 항상 >= 0.5. 0.5에 가까울수록 점수 1에 가까워지도록 반전.
  return 1 - (upperBound - 0.5) * 2;
}
