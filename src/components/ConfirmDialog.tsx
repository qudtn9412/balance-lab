"use client";

import { useEffect } from "react";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pending,
  danger = true,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  pending?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-background p-5 shadow-xl"
      >
        <div className="flex flex-col gap-1.5">
          <h3 className="font-semibold">{title}</h3>
          {description && <p className="text-sm text-zinc-500">{description}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-40 dark:border-zinc-700"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-40 ${
              danger ? "bg-red-600" : "bg-foreground text-background"
            }`}
          >
            {pending ? "처리 중..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
