export default function GameCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center justify-between gap-2">
        <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <OptionThumbSkeleton />
        <OptionThumbSkeleton />
      </div>
    </div>
  );
}

function OptionThumbSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      <div className="aspect-square rounded-md bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
