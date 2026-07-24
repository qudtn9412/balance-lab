"use client";

import { useState } from "react";

type Comment = {
  id: string;
  content: string;
  created_at: string;
};

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.error === "string") return data.error;
  } catch {
    // 응답이 JSON이 아닌 경우 상태 코드만 보여준다.
  }
  return `요청에 실패했습니다 (${res.status})`;
}

export default function CommentSection({
  slug,
  initialComments,
}: {
  slug: string;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/games/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      if (!res.ok) {
        setError(await extractErrorMessage(res));
        return;
      }

      // Route Handler가 생성된 행을 돌려주지 않으므로 낙관적으로 화면에 먼저 반영한다.
      setComments((prev) => [
        { id: crypto.randomUUID(), content: trimmed, created_at: new Date().toISOString() },
        ...prev,
      ]);
      setContent("");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold">댓글 {comments.length}</h2>

      <div className="flex flex-col gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={300}
          rows={2}
          disabled={submitting}
          placeholder="댓글을 남겨보세요"
          className="resize-none rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400">{content.length}/300</span>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-40 dark:border-zinc-700"
          >
            {submitting ? "등록 중..." : "댓글 등록"}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <ul className="flex flex-col gap-3">
        {comments.map((comment) => (
          <li key={comment.id} className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
            {comment.content}
          </li>
        ))}
        {comments.length === 0 && <li className="text-sm text-zinc-500">아직 댓글이 없습니다.</li>}
      </ul>
    </div>
  );
}
