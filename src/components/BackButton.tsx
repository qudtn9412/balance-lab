"use client";

import { useRouter } from "next/navigation";

/**
 * 브라우저 히스토리로 돌아간다 (랭킹에서 들어왔으면 랭킹의 탭까지 그대로 복원됨).
 * 히스토리가 없는 경우(직접 링크로 진입 등)에만 홈으로 보낸다.
 */
export default function BackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
  const router = useRouter();

  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex w-fit shrink-0 self-start items-center gap-1 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-foreground hover:text-foreground dark:border-zinc-700 dark:text-zinc-300"
    >
      ← 목록으로
    </button>
  );
}
