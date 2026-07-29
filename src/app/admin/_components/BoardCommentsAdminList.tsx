"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useRequestGuard } from "@/lib/hooks/use-request-guard";

type BoardCommentRow = {
  id: string;
  nickname: string;
  content: string;
  created_at: string;
};

/** 소통게시판은 게임 신고 같은 사용자 신고 체계가 없어서, 관리자 삭제가 유일한 모더레이션 수단이다. */
export default function BoardCommentsAdminList({ items }: { items: BoardCommentRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const guard = useRequestGuard();

  async function handleDelete(id: string) {
    if (!guard.begin(id)) return;
    setPendingId(id);
    try {
      const res = await fetch(`/api/admin/board-comments/${id}/delete`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setPendingId(null);
      setConfirmingId(null);
      guard.end(id);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-500">등록된 글이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.id} className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-zinc-500">
              {item.nickname} · {new Date(item.created_at).toLocaleString("ko-KR", { hour12: false })}
            </span>
            <button
              type="button"
              onClick={() => setConfirmingId(item.id)}
              disabled={pendingId === item.id}
              className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-600 disabled:opacity-40 dark:border-red-900"
            >
              삭제
            </button>
          </div>
          <p className="whitespace-pre-wrap break-words">{item.content}</p>
        </div>
      ))}

      <ConfirmDialog
        open={confirmingId !== null}
        title="글을 삭제할까요?"
        description="삭제하면 되돌릴 수 없습니다."
        confirmLabel="네, 삭제"
        pending={pendingId !== null}
        onConfirm={() => confirmingId && handleDelete(confirmingId)}
        onCancel={() => setConfirmingId(null)}
      />
    </div>
  );
}
