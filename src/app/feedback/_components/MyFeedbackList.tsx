type FeedbackRow = {
  id: string;
  content: string;
  status: string;
  created_at: string;
  admin_reply: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  open: "🟡 처리 중",
  resolved: "🟢 해결됨",
};

export default function MyFeedbackList({ items }: { items: FeedbackRow[] }) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-zinc-500">내가 보낸 건의</h2>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-zinc-400">
                {new Date(item.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", hour12: false })}
              </span>
              <span className="shrink-0 text-xs font-medium">{STATUS_LABEL[item.status] ?? item.status}</span>
            </div>
            <p className="whitespace-pre-wrap break-words">{item.content}</p>
            {item.admin_reply && (
              <div className="flex flex-col gap-1 rounded-md bg-zinc-100 p-2.5 dark:bg-zinc-900">
                <span className="text-xs font-medium text-zinc-500">💬 운영자 답변</span>
                <p className="whitespace-pre-wrap break-words text-sm">{item.admin_reply}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
