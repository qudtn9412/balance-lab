import Link from "next/link";

type OptionData = {
  imageUrl: string;
  title: string | null;
  votes: number;
};

export default function GameCard({
  slug,
  optionA,
  optionB,
  rank,
  likesCount,
  commentsCount,
  creatorNickname,
}: {
  slug: string;
  optionA: OptionData;
  optionB: OptionData;
  rank?: number;
  likesCount?: number;
  commentsCount?: number;
  creatorNickname?: string | null;
}) {
  const total = optionA.votes + optionB.votes;
  const pctA = total === 0 ? 50 : Math.round((optionA.votes / total) * 100);
  const pctB = 100 - pctA;

  return (
    <Link
      href={`/games/${slug}`}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 transition hover:border-foreground dark:border-zinc-800"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-sm">
          {rank !== undefined && <span className="shrink-0 font-semibold text-zinc-500">#{rank}</span>}
          {creatorNickname && <span className="truncate text-xs text-zinc-400">by {creatorNickname}</span>}
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-2 text-xs text-zinc-500">
          {likesCount !== undefined && <span>♥ {likesCount}</span>}
          {commentsCount !== undefined && <span>댓글 {commentsCount}</span>}
          <span>투표 {total}표</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <OptionThumb option={optionA} label="A" percent={pctA} />
        <OptionThumb option={optionB} label="B" percent={pctB} />
      </div>
    </Link>
  );
}

function OptionThumb({ option, label, percent }: { option: OptionData; label: string; percent: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="aspect-square overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={option.imageUrl} alt={option.title ?? `옵션 ${label}`} className="h-full w-full object-cover" />
      </div>
      <p className="line-clamp-2 break-words text-xs font-medium">{option.title ?? `옵션 ${label}`}</p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div className="h-full bg-foreground" style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs text-zinc-500">{percent}%</span>
    </div>
  );
}
