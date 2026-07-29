"use client";

import { useEffect, useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { NICKNAME_MAX_LENGTH, readSavedNickname, saveNickname } from "@/lib/nickname";
import { useRequestGuard } from "@/lib/hooks/use-request-guard";

type BoardComment = {
  id: string;
  content: string;
  nickname: string;
  created_at: string;
  isMine: boolean;
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

/** 게임 상세의 CommentSection과 동일한 패턴이다 — game_id가 없는 독립 스트림이라 slug 없이 /api/board/comments를 친다. */
export default function BoardCommentSection({ initialComments }: { initialComments: BoardComment[] }) {
  const [comments, setComments] = useState(initialComments);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editPending, setEditPending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const guard = useRequestGuard();

  useEffect(() => {
    setNickname(readSavedNickname());
  }, []);

  async function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed || submitting || !guard.begin("submit")) return;

    setSubmitting(true);
    setError(null);
    saveNickname(nickname);

    try {
      const res = await fetch("/api/board/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed, nickname }),
      });

      if (!res.ok) {
        setError(await extractErrorMessage(res));
        return;
      }

      const { id } = (await res.json()) as { id: string };
      setComments((prev) => [
        {
          id,
          content: trimmed,
          nickname: nickname.trim() || "익명",
          created_at: new Date().toISOString(),
          isMine: true,
        },
        ...prev,
      ]);
      setContent("");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
      guard.end("submit");
    }
  }

  function startEditing(comment: BoardComment) {
    setEditingId(comment.id);
    setEditContent(comment.content);
  }

  async function handleEditSubmit() {
    const trimmed = editContent.trim();
    if (!editingId || !trimmed || editPending || !guard.begin("edit")) return;

    setEditPending(true);
    try {
      const res = await fetch(`/api/board/comments/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      if (!res.ok) {
        setError(await extractErrorMessage(res));
        return;
      }

      setComments((prev) => prev.map((c) => (c.id === editingId ? { ...c, content: trimmed } : c)));
      setEditingId(null);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setEditPending(false);
      guard.end("edit");
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingId || deletePending || !guard.begin("delete")) return;

    setDeletePending(true);
    try {
      const res = await fetch(`/api/board/comments/${deletingId}`, { method: "DELETE" });
      if (!res.ok) {
        setError(await extractErrorMessage(res));
        return;
      }
      setComments((prev) => prev.filter((c) => c.id !== deletingId));
      setDeletingId(null);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setDeletePending(false);
      guard.end("delete");
    }
  }

  return (
    <div className="flex flex-col gap-4">
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
          maxLength={300}
          rows={2}
          disabled={submitting}
          placeholder="아무 얘기나 편하게 남겨보세요"
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
            {submitting ? "등록 중..." : "등록"}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <ul className="flex flex-col gap-3">
        {comments.map((comment) => (
          <li key={comment.id} className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-xs font-medium text-zinc-500">{comment.nickname}</span>
              {comment.isMine && editingId !== comment.id && (
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => startEditing(comment)}
                    className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium dark:border-zinc-700"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(comment.id)}
                    className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-red-600 dark:border-red-900"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>

            {editingId === comment.id ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  maxLength={300}
                  rows={2}
                  disabled={editPending}
                  className="resize-none rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    disabled={editPending}
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium disabled:opacity-40 dark:border-zinc-700"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleEditSubmit}
                    disabled={!editContent.trim() || editPending}
                    className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-40"
                  >
                    {editPending ? "저장 중..." : "저장"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-words">{comment.content}</p>
            )}
          </li>
        ))}
        {comments.length === 0 && <li className="text-sm text-zinc-500">아직 글이 없습니다. 첫 글을 남겨보세요!</li>}
      </ul>

      <ConfirmDialog
        open={deletingId !== null}
        title="글을 삭제할까요?"
        description="삭제한 글은 되돌릴 수 없습니다."
        confirmLabel="네, 삭제"
        pending={deletePending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
