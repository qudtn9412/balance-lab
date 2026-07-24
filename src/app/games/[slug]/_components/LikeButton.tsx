"use client";

import { useState } from "react";

export default function LikeButton({
  slug,
  initialLiked,
  initialCount,
}: {
  slug: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (pending) return;
    setPending(true);

    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    try {
      const res = await fetch(`/api/games/${slug}/like`, { method: "POST" });
      if (!res.ok) {
        setLiked(!nextLiked);
        setCount((c) => c - (nextLiked ? 1 : -1));
        return;
      }
      const data = (await res.json()) as { liked: boolean };
      setLiked(data.liked);
    } catch {
      setLiked(!nextLiked);
      setCount((c) => c - (nextLiked ? 1 : -1));
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium disabled:opacity-40 ${
        liked
          ? "border-red-300 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950"
          : "border-zinc-300 dark:border-zinc-700"
      }`}
    >
      <span>{liked ? "♥" : "♡"}</span>
      <span>좋아요 {count}</span>
    </button>
  );
}
