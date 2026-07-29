"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <span className="text-4xl">⚠️</span>
      <h1 className="text-xl font-bold">문제가 발생했어요</h1>
      <p className="text-sm text-zinc-500">잠시 후 다시 시도해주세요.</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium transition hover:border-foreground dark:border-zinc-700"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
