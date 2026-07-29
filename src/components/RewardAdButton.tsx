"use client";

import { useState } from "react";
import { isRewardAdAvailable, requestRewardAd } from "@/lib/ads/reward-ad";
import { useRequestGuard } from "@/lib/hooks/use-request-guard";

type Status = "idle" | "watching" | "granting" | "dismissed" | "error" | "unavailable";

/**
 * "광고 보고 추가 생성권 받기" 버튼. 시청 완료(adViewed) 시에만 서버에 보상 지급을 요청한다 —
 * 클라이언트가 "봤다"고 주장하는 값을 그대로 믿지 않도록 /api/ads/reward가 하루 시청 상한을
 * 다시 한번 서버에서 검증한다.
 */
export default function RewardAdButton({ onGranted }: { onGranted: () => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const guard = useRequestGuard();

  async function handleClick() {
    if (status === "watching" || status === "granting" || !guard.begin()) return;

    try {
      if (!isRewardAdAvailable()) {
        setStatus("unavailable");
        return;
      }

      setStatus("watching");
      const viewed = await requestRewardAd();
      if (!viewed) {
        setStatus("dismissed");
        return;
      }

      setStatus("granting");
      const res = await fetch("/api/ads/reward", { method: "POST" });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("idle");
      onGranted();
    } catch {
      setStatus("error");
    } finally {
      guard.end();
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "watching" || status === "granting"}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium disabled:opacity-40 dark:border-zinc-700"
      >
        {status === "watching"
          ? "광고 재생 중..."
          : status === "granting"
            ? "생성권 지급 중..."
            : "광고 보고 추가 생성권 받기"}
      </button>
      {status === "dismissed" && (
        <span className="text-xs text-zinc-500">광고를 끝까지 봐야 생성권을 받을 수 있어요.</span>
      )}
      {status === "unavailable" && (
        <span className="text-xs text-zinc-500">지금은 광고를 불러올 수 없어요.</span>
      )}
      {status === "error" && (
        <span className="text-xs text-red-600">지급에 실패했어요. 잠시 후 다시 시도해주세요.</span>
      )}
    </div>
  );
}
