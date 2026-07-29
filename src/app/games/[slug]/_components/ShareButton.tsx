"use client";

import { useState } from "react";
import QRCode from "qrcode";

/**
 * 공유가 이 서비스의 핵심 성장 동력(CLAUDE.md)이지만, OS 기본 공유시트(Web Share API)는
 * 설치된 앱에 따라 매번 다른 아이콘이 떠서 UX가 들쭉날쭉했다. 링크 복사와 QR 코드 생성,
 * 두 가지만 고정 제공한다 — QR은 외부 API 없이 브라우저에서 직접 생성해 링크가 제3자
 * 서비스로 나가지 않게 한다.
 */
export default function ShareButton() {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 API를 쓸 수 없는 아주 예전 브라우저 — 별도 처리 없이 무시한다.
    }
  }

  async function handleToggleQr() {
    if (qrDataUrl) {
      setQrDataUrl(null);
      return;
    }
    const dataUrl = await QRCode.toDataURL(window.location.href, { width: 220, margin: 1 });
    setQrDataUrl(dataUrl);
  }

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium dark:border-zinc-700"
      >
        {copied ? "✓ 링크 복사됨" : "🔗 링크 복사"}
      </button>
      <button
        type="button"
        onClick={handleToggleQr}
        className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium dark:border-zinc-700"
      >
        📱 QR 코드
      </button>
      {qrDataUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- 클라이언트에서 생성한 data URL이라 next/image 최적화 대상이 아님
        <img
          src={qrDataUrl}
          alt="공유 링크 QR 코드"
          width={180}
          height={180}
          className="absolute top-full left-0 z-10 mt-2 rounded-lg border border-zinc-300 bg-white p-2 shadow-lg dark:border-zinc-700"
        />
      )}
    </div>
  );
}
