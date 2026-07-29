export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 animate-pulse flex-col gap-6 px-6 py-12">
      <div className="h-8 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-7 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-32 w-full rounded-md bg-zinc-200 dark:bg-zinc-800" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 w-full rounded-md bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}
