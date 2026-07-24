"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function SiteHeader({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const isRankings = pathname.startsWith("/rankings");
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
      <nav className="flex items-center gap-4 text-sm">
        <Link
          href="/rankings"
          aria-current={isRankings ? "page" : undefined}
          className={
            isRankings
              ? "font-semibold text-foreground"
              : "text-zinc-600 hover:text-foreground dark:text-zinc-400"
          }
        >
          랭킹
        </Link>
        <Link
          href="/games/new"
          className="rounded-full bg-foreground px-4 py-1.5 font-medium text-background"
        >
          만들기
        </Link>
        {isAdmin && (
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-zinc-500 hover:text-foreground disabled:opacity-40"
          >
            로그아웃
          </button>
        )}
      </nav>
    </header>
  );
}
