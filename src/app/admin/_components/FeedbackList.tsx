"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useRequestGuard } from "@/lib/hooks/use-request-guard";

type FeedbackRow = {
  id: string;
  nickname: string;
  content: string;
  status: string;
  created_at: string;
};

export default function FeedbackList({ items }: { items: FeedbackRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const guard = useRequestGuard();

  async function handleToggle(id: string) {
    const key = `toggle:${id}`;
    if (!guard.begin(key)) return;
    setPendingId(id);
    try {
      const res = await fetch(`/api/admin/feedback/${id}/toggle-status`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setPendingId(null);
      guard.end(key);
    }
  }

  async function handleDelete(id: string) {
    const key = `delete:${id}`;
    if (!guard.begin(key)) return;
    setPendingId(id);
    try {
      const res = await fetch(`/api/admin/feedback/${id}/delete`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setPendingId(null);
      setConfirmingId(null);
      guard.end(key);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-500">들어온 건의사항이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex flex-col gap-2 rounded-lg border p-3 text-sm ${
            item.status === "resolved"
              ? "border-zinc-200 opacity-60 dark:border-zinc-800"
              : "border-zinc-200 dark:border-zinc-800"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-zinc-500">
              {item.nickname} · {new Date(item.created_at).toLocaleString("ko-KR", { hour12: false })}
            </span>
            <div className="flex shrink-0 gap-1.5">
              <button
                type="button"
                onClick={() => handleToggle(item.id)}
                disabled={pendingId === item.id}
                className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium disabled:opacity-40 dark:border-zinc-700"
              >
                {item.status === "resolved" ? "다시 열기" : "해결 처리"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingId(item.id)}
                disabled={pendingId === item.id}
                className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-600 disabled:opacity-40 dark:border-red-900"
              >
                삭제
              </button>
            </div>
          </div>
          <p className="whitespace-pre-wrap break-words">{item.content}</p>
        </div>
      ))}

      <ConfirmDialog
        open={confirmingId !== null}
        title="건의사항을 삭제할까요?"
        description="삭제하면 되돌릴 수 없습니다."
        confirmLabel="네, 삭제"
        pending={pendingId !== null}
        onConfirm={() => confirmingId && handleDelete(confirmingId)}
        onCancel={() => setConfirmingId(null)}
      />
    </div>
  );
}
