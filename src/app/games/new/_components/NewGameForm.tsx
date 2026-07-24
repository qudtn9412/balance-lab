"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import RewardAdButton from "@/components/RewardAdButton";

type GenStatus = "idle" | "generating" | "done" | "error";

type OptionState = {
  prompt: string;
  title: string;
  imageUrl: string | null;
  status: GenStatus;
  error: string | null;
  errorStatus: number | null;
};

const EMPTY_OPTION: OptionState = {
  prompt: "",
  title: "",
  imageUrl: null,
  status: "idle",
  error: null,
  errorStatus: null,
};

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.error === "string") return data.error;
  } catch {
    // 응답이 JSON이 아닌 경우(예: 미처리 서버 에러 페이지) 상태 코드만 보여준다.
  }
  return `요청에 실패했습니다 (${res.status})`;
}

const PROMPT_GUIDE_NOTICES = [
  "혐오·차별적이거나 선정적인 이미지는 생성되지 않아요.",
  "특정 연예인 등 실존 인물을 지칭하는 프롬프트는 초상권 보호를 위해 검열에 걸려 생성이 제한될 수 있어요.",
  "원하는 결과를 얻으려면 옷차림, 배경, 분위기 등을 최대한 구체적으로 적어주세요.",
];

export default function NewGameForm() {
  const router = useRouter();
  const [optionA, setOptionA] = useState<OptionState>(EMPTY_OPTION);
  const [optionB, setOptionB] = useState<OptionState>(EMPTY_OPTION);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleGenerate(side: "a" | "b") {
    const option = side === "a" ? optionA : optionB;
    const setOption = side === "a" ? setOptionA : setOptionB;
    const prompt = option.prompt.trim();
    if (!prompt || option.status === "generating") return;

    setOption((prev) => ({ ...prev, status: "generating", error: null, errorStatus: null }));

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const message = await extractErrorMessage(res);
        setOption((prev) => ({ ...prev, status: "error", error: message, errorStatus: res.status }));
        return;
      }

      const data = (await res.json()) as { imageUrl: string };
      setOption((prev) => ({ ...prev, status: "done", imageUrl: data.imageUrl }));
    } catch {
      setOption((prev) => ({ ...prev, status: "error", error: "네트워크 오류가 발생했습니다.", errorStatus: null }));
    }
  }

  async function handleSubmit() {
    if (!optionA.prompt.trim() || !optionB.prompt.trim() || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionA: {
            prompt: optionA.prompt,
            imageUrl: optionA.status === "done" ? optionA.imageUrl : undefined,
            title: optionA.title || undefined,
          },
          optionB: {
            prompt: optionB.prompt,
            imageUrl: optionB.status === "done" ? optionB.imageUrl : undefined,
            title: optionB.title || undefined,
          },
        }),
      });

      if (!res.ok) {
        setSubmitError(await extractErrorMessage(res));
        return;
      }

      const { slug } = (await res.json()) as { slug: string };
      router.push(`/games/${slug}`);
    } catch {
      setSubmitError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = optionA.prompt.trim() !== "" && optionB.prompt.trim() !== "" && !submitting;

  return (
    <div className="flex flex-col gap-8">
      <ul className="flex flex-col gap-1.5 rounded-md border border-dashed border-zinc-300 p-3 text-xs text-zinc-500 dark:border-zinc-700">
        {PROMPT_GUIDE_NOTICES.map((notice) => (
          <li key={notice} className="flex gap-1.5">
            <span aria-hidden className="text-zinc-400">
              ·
            </span>
            {notice}
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <OptionEditor label="옵션 A" option={optionA} onChange={setOptionA} onGenerate={() => handleGenerate("a")} />
        <OptionEditor label="옵션 B" option={optionB} onChange={setOptionB} onGenerate={() => handleGenerate("b")} />
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={handleSubmit}
        className="self-center rounded-full bg-foreground px-6 py-3 font-medium text-background disabled:opacity-40"
      >
        {submitting ? "등록 중..." : "밸런스게임 등록"}
      </button>
    </div>
  );
}

function OptionEditor({
  label,
  option,
  onChange,
  onGenerate,
}: {
  label: string;
  option: OptionState;
  onChange: Dispatch<SetStateAction<OptionState>>;
  onGenerate: () => void;
}) {
  const generating = option.status === "generating";

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="font-semibold">{label}</h2>

      <label className="flex flex-col gap-1 text-sm">
        <span className="flex items-center justify-between">
          프롬프트
          <span className="text-xs text-zinc-400">{option.prompt.length}/500</span>
        </span>
        <textarea
          value={option.prompt}
          onChange={(e) => onChange((prev) => ({ ...prev, prompt: e.target.value }))}
          maxLength={500}
          rows={3}
          disabled={generating}
          placeholder="예: 한여름에도 패딩 입고 다니는 사람"
          className="resize-none rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="flex items-center justify-between">
          타이틀 (선택)
          <span className="text-xs text-zinc-400">{option.title.length}/40</span>
        </span>
        <input
          value={option.title}
          onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
          maxLength={40}
          placeholder="카드에 표시될 짧은 제목"
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
      </label>

      <button
        type="button"
        onClick={onGenerate}
        disabled={!option.prompt.trim() || generating}
        className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-40 dark:border-zinc-700"
      >
        {generating ? "생성 중..." : option.status === "done" ? "다시 생성" : "이미지 생성"}
      </button>

      <div className="flex aspect-square items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-2 text-center text-xs text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
        {option.status === "done" && option.imageUrl ? (
          // Cloudflare Workers AI가 base64 데이터 URI로 이미지를 반환하므로 remotePatterns 설정 없이도 동작하는 img 태그를 사용한다.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={option.imageUrl} alt={label} className="h-full w-full rounded-md object-cover" />
        ) : generating ? (
          "이미지 생성 중... (몇 초 걸릴 수 있어요)"
        ) : option.status === "error" ? (
          <span className="text-red-600">{option.error}</span>
        ) : (
          "미리보기"
        )}
      </div>

      {option.status === "error" && option.errorStatus === 429 && (
        <RewardAdButton onGranted={onGenerate} />
      )}
    </div>
  );
}
