"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRequestGuard } from "@/lib/hooks/use-request-guard";

export default function AdminLoginForm() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const guard = useRequestGuard();

  async function handleSubmit() {
    if (!secret || submitting || !guard.begin()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "로그인에 실패했습니다.");
        return;
      }

      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
      guard.end();
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="flex w-full flex-col gap-5 rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-2xl">🔐</span>
          <h1 className="text-lg font-bold">관리자 로그인</h1>
          <p className="text-xs text-zinc-500">신고 검토 등 관리 기능은 비밀번호로 보호됩니다.</p>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          비밀번호
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="비밀번호를 입력하세요"
            autoFocus
            className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!secret || submitting}
          className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition disabled:opacity-40 enabled:hover:opacity-90"
        >
          {submitting ? "확인 중..." : "로그인"}
        </button>
      </div>
    </div>
  );
}
