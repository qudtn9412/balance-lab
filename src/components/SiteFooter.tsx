import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="flex flex-col items-center gap-2 border-t border-zinc-200 px-6 py-6 text-center text-xs text-zinc-400 dark:border-zinc-800">
      <nav className="flex gap-4">
        <Link href="/feedback" className="hover:text-foreground">
          건의하기
        </Link>
        <Link href="/terms" className="hover:text-foreground">
          이용약관
        </Link>
        <Link href="/privacy" className="hover:text-foreground">
          개인정보처리방침
        </Link>
      </nav>
      <p>© {new Date().getFullYear()} 밸런스랩 — 프롬프트 두 개로 만드는 1:1 밸런스게임</p>
    </footer>
  );
}
