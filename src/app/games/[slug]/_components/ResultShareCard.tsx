"use client";

import { useState } from "react";

type Choice = "a" | "b";

/**
 * 투표 직후 "내 선택 결과 카드"를 공유하게 만드는 버튼. 단순 링크 공유보다 개인화된 이미지가
 * 훨씬 더 잘 퍼진다(성격테스트류 밈의 핵심 메커니즘). /api/games/[slug]/result-card가 만든 PNG를
 * 파일 공유가 되는 환경(대부분의 모바일)에서는 카카오톡/인스타 공유시트로 바로 띄우고,
 * 안 되면 다운로드로 대체한다.
 */
export default function ResultShareCard({ slug, choice }: { slug: string; choice: Choice }) {
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");

  async function handleShare() {
    if (status === "working") return;
    setStatus("working");

    const cardUrl = `/api/games/${slug}/result-card?choice=${choice}`;
    const pageUrl = window.location.href;

    try {
      const res = await fetch(cardUrl);
      if (!res.ok) throw new Error("card fetch failed");
      const blob = await res.blob();
      const file = new File([blob], "balancelab-result.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "밸런스랩", text: "내 밸런스게임 결과 확인해봐!", url: pageUrl });
      } else if (navigator.share) {
        await navigator.share({ title: "밸런스랩", text: "내 밸런스게임 결과 확인해봐!", url: pageUrl });
      } else {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = "balancelab-result.png";
        a.click();
        URL.revokeObjectURL(blobUrl);
      }
      setStatus("idle");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setStatus("idle");
        return;
      }
      setStatus("error");
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={status === "working"}
      className="self-center rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium transition disabled:opacity-40 dark:border-zinc-700"
    >
      {status === "working" ? "카드 만드는 중..." : status === "error" ? "실패, 다시 시도" : "🖼️ 결과 카드 공유"}
    </button>
  );
}
