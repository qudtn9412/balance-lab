import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <span className="text-4xl">🔍</span>
      <h1 className="text-xl font-bold">페이지를 찾을 수 없어요</h1>
      <p className="text-sm text-zinc-500">삭제됐거나 잘못된 주소일 수 있어요.</p>
      <div className="flex gap-2">
        <Link
          href="/"
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
        >
          홈으로
        </Link>
        <Link
          href="/games/new"
          className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium transition hover:border-foreground dark:border-zinc-700"
        >
          밸런스게임 만들기
        </Link>
      </div>
    </div>
  );
}
