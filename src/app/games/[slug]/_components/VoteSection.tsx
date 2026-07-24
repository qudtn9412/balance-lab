"use client";

import { useState } from "react";

type Choice = "a" | "b";

type OptionData = {
  imageUrl: string;
  title: string | null;
  votes: number;
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

export default function VoteSection({
  slug,
  optionA,
  optionB,
  initialChoice,
}: {
  slug: string;
  optionA: OptionData;
  optionB: OptionData;
  initialChoice: Choice | null;
}) {
  const [choice, setChoice] = useState<Choice | null>(initialChoice);
  const [pending, setPending] = useState<Choice | null>(null);
  const [votesA, setVotesA] = useState(optionA.votes);
  const [votesB, setVotesB] = useState(optionB.votes);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = choice !== null || error === "이미 투표하셨습니다.";

  function handleSelect(side: Choice) {
    if (locked || submitting) return;
    setPending((prev) => (prev === side ? null : side));
    setError(null);
  }

  async function handleConfirm() {
    if (!pending || locked || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/games/${slug}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice: pending }),
      });

      if (res.status === 409) {
        setError("이미 투표하셨습니다.");
        return;
      }
      if (!res.ok) {
        setError(await extractErrorMessage(res));
        return;
      }

      setChoice(pending);
      if (pending === "a") setVotesA((v) => v + 1);
      else setVotesB((v) => v + 1);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  const total = votesA + votesB;
  const pctA = total === 0 ? 50 : Math.round((votesA / total) * 100);
  const pctB = 100 - pctA;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative grid grid-cols-2 gap-3 sm:gap-6">
        <OptionCard
          option={optionA}
          label="A"
          percent={pctA}
          votes={votesA}
          isMine={choice === "a"}
          isPending={pending === "a"}
          locked={locked}
          onSelect={() => handleSelect("a")}
        />
        <OptionCard
          option={optionB}
          label="B"
          percent={pctB}
          votes={votesB}
          isMine={choice === "b"}
          isPending={pending === "b"}
          locked={locked}
          onSelect={() => handleSelect("b")}
        />

        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background shadow-md sm:h-12 sm:w-12 sm:text-sm">
          VS
        </div>
      </div>

      {!locked && (
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!pending || submitting}
          className="self-center rounded-full bg-foreground px-8 py-3 text-sm font-bold text-background transition disabled:scale-100 disabled:opacity-30 enabled:hover:scale-105 enabled:active:scale-95"
        >
          {submitting ? "제출 중..." : pending ? "이걸로 확정! 🔥" : "먼저 하나를 골라주세요"}
        </button>
      )}

      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}

function OptionCard({
  option,
  label,
  percent,
  votes,
  isMine,
  isPending,
  locked,
  onSelect,
}: {
  option: OptionData;
  label: string;
  percent: number;
  votes: number;
  isMine: boolean;
  isPending: boolean;
  locked: boolean;
  onSelect: () => void;
}) {
  const selected = isMine || isPending;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={locked}
      className={`group flex flex-col gap-2 rounded-xl border-2 p-2 text-left transition ${
        selected
          ? "border-foreground"
          : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
      } ${locked ? "cursor-default" : "cursor-pointer active:scale-[0.98]"}`}
    >
      <div
        className={`relative aspect-square overflow-hidden rounded-lg bg-zinc-100 transition dark:bg-zinc-900 ${
          !locked && "group-hover:scale-[1.02] group-active:scale-[0.97]"
        }`}
      >
        {/* 이미지가 어느 호스트에서 올지 아직 정해지지 않아 next/image remotePatterns 없이 동작하는 img를 사용 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={option.imageUrl} alt={option.title ?? `옵션 ${label}`} className="h-full w-full object-cover" />

        {selected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-xl text-background shadow-lg">
              ✓
            </span>
          </div>
        )}

        {locked && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/30">
              <div className="h-full bg-white" style={{ width: `${percent}%` }} />
            </div>
            <span className="text-xs font-medium text-white">
              {percent}% ({votes}표){isMine && " · 내 선택"}
            </span>
          </div>
        )}
      </div>

      <p className="line-clamp-2 text-center text-sm font-medium">{option.title ?? `옵션 ${label}`}</p>
    </button>
  );
}
