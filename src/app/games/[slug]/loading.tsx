export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 animate-pulse flex-col gap-8 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div className="h-8 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-8 w-32 rounded-md bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        <div className="aspect-square rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="aspect-square rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />

      <div className="flex flex-col gap-3">
        <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-20 w-full rounded-md bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
