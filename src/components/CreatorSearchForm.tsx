"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatorSearchForm({ initialValue }: { initialValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    router.push(trimmed ? `/?creator=${encodeURIComponent(trimmed)}` : "/");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="제작자 닉네임으로 검색"
        className="w-full max-w-[200px] rounded-full border border-zinc-300 px-3 py-1.5 text-xs focus:border-foreground focus:outline-none dark:border-zinc-700 dark:bg-transparent"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:border-foreground dark:border-zinc-700"
      >
        검색
      </button>
    </form>
  );
}
