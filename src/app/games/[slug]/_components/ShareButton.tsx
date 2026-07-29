"use client";

import { useState } from "react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 API를 쓸 수 없는 아주 예전 브라우저 — 별도 처리 없이 무시한다.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium dark:border-zinc-700"
    >
      {copied ? "✓ 링크 복사됨" : "🔗 링크 복사"}
    </button>
  );
}
