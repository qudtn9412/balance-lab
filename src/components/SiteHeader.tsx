"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navChip =
  "rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-foreground hover:text-foreground disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400";
const navChipActive = "rounded-full border border-foreground bg-foreground px-3 py-1.5 text-xs font-medium text-background";

export default function SiteHeader({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const isRankings = pathname.startsWith("/rankings");
  const isMyGames = pathname.startsWith("/my-games");
  const isBoard = pathname.startsWith("/board");
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
      <Link href="/" className="font-bold">
        밸런스랩
      </Link>
      <nav className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/rankings"
          aria-current={isRankings ? "page" : undefined}
          className={isRankings ? navChipActive : navChip}
        >
          랭킹
        </Link>
        <Link
          href="/board"
          aria-current={isBoard ? "page" : undefined}
          className={isBoard ? navChipActive : navChip}
        >
          소통게시판
        </Link>
        <Link
          href="/my-games"
          aria-current={isMyGames ? "page" : undefined}
          className={isMyGames ? navChipActive : navChip}
        >
          내 게임
        </Link>
        <Link
          href="/games/new"
          className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition hover:opacity-90"
        >
          만들기
        </Link>
        {isAdmin && (
          <button type="button" onClick={handleLogout} disabled={loggingOut} className={navChip}>
            {loggingOut ? "..." : "로그아웃"}
          </button>
        )}
      </nav>
    </header>
  );
}
