"use client";

import { useEffect, useState } from "react";
import { NICKNAME_MAX_LENGTH, readSavedNickname, saveNickname } from "@/lib/nickname";

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.error === "string") return data.error;
  } catch {
    // 응답이 JSON이 아닌 경우 상태 코드만 보여준다.
  }
  return `요청에 실패했습니다 (${res.status})`;
}

export default function FeedbackForm() {
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setNickname(readSavedNickname());
  }, []);

  async function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setError(null);
    saveNickname(nickname);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed, nickname }),
      });

      if (!res.ok) {
        setError(await extractErrorMessage(res));
        return;
      }

      setContent("");
      setDone(true);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <span className="text-2xl">✅</span>
        <p className="text-sm font-medium">전달됐어요. 읽고 있어요, 감사합니다!</p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-2 text-xs text-zinc-500 underline hover:text-foreground"
        >
          하나 더 보내기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1 text-sm">
        <span className="flex items-center justify-between">
          닉네임 (선택)
          <span className="text-xs text-zinc-400">
            {nickname.length}/{NICKNAME_MAX_LENGTH}
          </span>
        </span>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={NICKNAME_MAX_LENGTH}
          placeholder="입력하지 않으면 '익명'으로 표시돼요"
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
      </label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={1000}
        rows={6}
        disabled={submitting}
        placeholder="불편했던 점, 버그, 추가됐으면 하는 기능 등 편하게 남겨주세요. 저만 봅니다."
        className="resize-none rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">{content.length}/1000</span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!content.trim() || submitting}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-40"
        >
          {submitting ? "보내는 중..." : "보내기"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
