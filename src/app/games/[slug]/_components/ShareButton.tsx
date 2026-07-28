"use client";

import { useState } from "react";

/**
 * 공유가 이 서비스의 핵심 성장 동력(CLAUDE.md)인데 지금까지 명시적인 공유 버튼이 없어서
 * og:meta로 링크가 우연히 퍼지길 기다리는 구조였다. 모바일에서는 Web Share API로 카카오톡/문자 등
 * 기본 공유 시트를 바로 띄우고, 미지원 환경(대부분의 데스크톱 브라우저)에서는 링크 복사로 대체한다.
 */
export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // 사용자가 공유 시트를 취소한 경우 등 — 조용히 무시한다.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 API를 쓸 수 없는 아주 예전 브라우저 — 별도 처리 없이 무시한다.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium disabled:opacity-40 dark:border-zinc-700"
    >
      {copied ? "✓ 링크 복사됨" : "🔗 공유하기"}
    </button>
  );
}
