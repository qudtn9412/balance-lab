"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useRequestGuard } from "@/lib/hooks/use-request-guard";

type GameRow = {
  slug: string;
  option_a_image_url: string;
  option_a_title: string | null;
  option_b_image_url: string;
  option_b_title: string | null;
  votes_a_count: number;
  votes_b_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
};

export default function AllGamesList({ games }: { games: GameRow[] }) {
  const router = useRouter();
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [confirmingSlug, setConfirmingSlug] = useState<string | null>(null);
  const [errorSlug, setErrorSlug] = useState<string | null>(null);
  const guard = useRequestGuard();

  async function handleDelete(slug: string) {
    if (!guard.begin(slug)) return;
    setPendingSlug(slug);
    setErrorSlug(null);
    try {
      const res = await fetch(`/api/admin/games/${slug}/delete`, { method: "POST" });
      if (!res.ok) {
        setErrorSlug(slug);
        return;
      }
      router.refresh();
    } finally {
      setPendingSlug(null);
      setConfirmingSlug(null);
      guard.end(slug);
    }
  }

  if (games.length === 0) {
    return (
      <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-500">등록된 게임이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {games.map((game) => (
        <div
          key={game.slug}
          className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800 sm:flex-row sm:items-center"
        >
          <div className="flex flex-1 items-center gap-3">
            <div className="flex shrink-0 gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={game.option_a_image_url} alt="A" className="h-14 w-14 rounded object-cover" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={game.option_b_image_url} alt="B" className="h-14 w-14 rounded object-cover" />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5 text-sm">
              <span className="line-clamp-2 break-words font-medium">
                {game.option_a_title ?? "옵션 A"} vs {game.option_b_title ?? "옵션 B"}
              </span>
              <span className="text-xs text-zinc-500">
                {new Date(game.created_at).toLocaleString("ko-KR", { hour12: false })} · ♥ {game.likes_count} · 댓글{" "}
                {game.comments_count} · 투표 {game.votes_a_count + game.votes_b_count}
              </span>
              {errorSlug === game.slug && <span className="text-xs text-red-600">삭제에 실패했습니다.</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:justify-end">
            <a
              href={`/games/${game.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium disabled:opacity-40 dark:border-zinc-700"
            >
              상세 보기
            </a>
            <button
              type="button"
              onClick={() => setConfirmingSlug(game.slug)}
              disabled={pendingSlug !== null}
              className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 disabled:opacity-40 dark:border-red-900"
            >
              삭제
            </button>
          </div>
        </div>
      ))}

      <ConfirmDialog
        open={confirmingSlug !== null}
        title="게임을 완전히 삭제할까요?"
        description="삭제하면 이미지와 데이터가 모두 사라지며 되돌릴 수 없습니다."
        confirmLabel="네, 삭제"
        pending={pendingSlug !== null}
        onConfirm={() => confirmingSlug && handleDelete(confirmingSlug)}
        onCancel={() => setConfirmingSlug(null)}
      />
    </div>
  );
}
