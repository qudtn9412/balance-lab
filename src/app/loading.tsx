import GameCardSkeleton from "@/components/GameCardSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-bold">밸런스랩</h1>
        <p className="max-w-lg text-balance text-zinc-600 dark:text-zinc-400">
          프롬프트 2개로 이미지를 만들고, 밸런스게임으로 등록해 투표를 받아보세요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
