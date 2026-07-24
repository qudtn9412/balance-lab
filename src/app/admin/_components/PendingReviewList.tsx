"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";

type GameRow = {
  slug: string;
  option_a_image_url: string;
  option_a_title: string | null;
  option_b_image_url: string;
  option_b_title: string | null;
  reportCount: number;
};

export default function PendingReviewList({ games }: { games: GameRow[] }) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [confirmingSlug, setConfirmingSlug] = useState<string | null>(null);
  const [errorSlug, setErrorSlug] = useState<string | null>(null);

  async function runAction(slug: string, action: "restore" | "delete") {
    setPendingAction(`${slug}:${action}`);
    setErrorSlug(null);
    try {
      const res = await fetch(`/api/admin/games/${slug}/${action}`, { method: "POST" });
      if (!res.ok) {
        setErrorSlug(slug);
        return;
      }
      router.refresh();
    } finally {
      setPendingAction(null);
      setConfirmingSlug(null);
    }
  }

  if (games.length === 0) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 text-center dark:border-zinc-700">
        <span className="text-2xl">✨</span>
        <p className="text-sm font-medium">검토할 신고가 없습니다</p>
        <p className="text-xs text-zinc-500">신고가 쌓여 자동 비공개된 게임이 생기면 여기에 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {games.map((game) => (
        <div key={game.slug} className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:flex-row sm:items-center">
          <div className="grid flex-1 grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={game.option_a_image_url} alt="A" className="aspect-square w-full rounded-md object-cover" />
              <span className="line-clamp-2 break-words text-xs">{game.option_a_title ?? "옵션 A"}</span>
            </div>
            <div className="flex flex-col gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={game.option_b_image_url} alt="B" className="aspect-square w-full rounded-md object-cover" />
              <span className="line-clamp-2 break-words text-xs">{game.option_b_title ?? "옵션 B"}</span>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="text-xs text-zinc-500">신고 {game.reportCount}건</span>
            <a
              href={`/games/${game.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium disabled:opacity-40 dark:border-zinc-700"
            >
              상세 보기
            </a>
            {errorSlug === game.slug && <span className="text-xs text-red-600">처리에 실패했습니다.</span>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => runAction(game.slug, "restore")}
                disabled={pendingAction !== null}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium disabled:opacity-40 dark:border-zinc-700"
              >
                {pendingAction === `${game.slug}:restore` ? "처리 중..." : "복원"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingSlug(game.slug)}
                disabled={pendingAction !== null}
                className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 disabled:opacity-40 dark:border-red-900"
              >
                완전 삭제
              </button>
            </div>
          </div>
        </div>
      ))}

      <ConfirmDialog
        open={confirmingSlug !== null}
        title="게임을 완전히 삭제할까요?"
        description="삭제하면 이미지와 데이터가 모두 사라지며 되돌릴 수 없습니다."
        confirmLabel="네, 삭제"
        pending={pendingAction !== null}
        onConfirm={() => confirmingSlug && runAction(confirmingSlug, "delete")}
        onCancel={() => setConfirmingSlug(null)}
      />
    </div>
  );
}
