"use client";

/**
 * Google Ad Placement API가 로드돼 있는지 확인한다. AdSense 퍼블리셔 ID가 설정되지
 * 않았거나(NEXT_PUBLIC_ADSENSE_PUBLISHER_ID) 스크립트가 아직 로드되기 전이면 false.
 */
export function isRewardAdAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.adBreak === "function";
}

/**
 * 리워드 광고를 띄우고 끝까지 시청했는지 여부를 Promise로 반환한다.
 * 실제 보상 지급(서버 크레딧 부여)은 호출부에서 true를 받은 뒤 /api/ads/reward를 호출해 처리한다 —
 * 클라이언트가 "봤다"고 우기는 값을 그대로 믿으면 안 되므로 여기서는 시청 여부만 판단한다.
 */
export function requestRewardAd(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!isRewardAdAvailable()) {
      resolve(false);
      return;
    }

    window.adBreak!({
      type: "reward",
      name: "extra_generation_credit",
      beforeReward: (showAdFn) => showAdFn(),
      adViewed: () => resolve(true),
      adDismissed: () => resolve(false),
    });
  });
}
