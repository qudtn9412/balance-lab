"use client";

import { useState } from "react";
import { useRequestGuard } from "@/lib/hooks/use-request-guard";

export default function ReportButton({ slug }: { slug: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const guard = useRequestGuard();

  async function handleReport() {
    if (status === "submitting" || status === "done" || !guard.begin()) return;
    setStatus("submitting");

    try {
      const res = await fetch(`/api/games/${slug}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    } finally {
      guard.end();
    }
  }

  if (status === "done") {
    return (
      <span className="flex items-center gap-1.5 rounded-md border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600 dark:border-green-900 dark:bg-green-950">
        ✓ 신고 접수됨
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleReport}
      disabled={status === "submitting"}
      className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium disabled:opacity-40 dark:border-zinc-700"
    >
      {status === "error" ? "신고 실패, 다시 시도" : "신고"}
    </button>
  );
}
