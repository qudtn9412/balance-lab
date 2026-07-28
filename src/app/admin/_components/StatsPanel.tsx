type TodayStats = {
  generated: number;
  activeClients: number;
  adsWatched: number;
  uniqueIPs: number;
  ipCapHits: number;
  gamesCreated: number;
  votesCast: number;
  jobStatusCounts: Record<string, number>;
};

type TopGenerator = {
  clientId: string;
  consumed: number;
  adsWatched: number;
};

type TrendPoint = {
  date: string;
  count: number;
};

function StatTile({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-2xl font-bold">{value.toLocaleString("ko-KR")}</p>
      {hint && <p className="text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

const JOB_STATUS_LABEL: Record<string, string> = {
  completed: "성공",
  blocked_text: "텍스트 필터 차단",
  blocked_nsfw: "NSFW 차단",
  failed: "실패",
  pending: "대기 중",
};

export default function StatsPanel({
  today,
  topGenerators,
  trend,
  totals,
}: {
  today: TodayStats;
  topGenerators: TopGenerator[];
  trend: TrendPoint[];
  totals: { games: number; votes: number };
}) {
  const maxTrend = Math.max(1, ...trend.map((t) => t.count));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="오늘 이미지 생성" value={today.generated} />
        <StatTile label="오늘 생성 사용자 수" value={today.activeClients} hint="client_id 기준" />
        <StatTile label="오늘 광고 시청" value={today.adsWatched} />
        <StatTile label="오늘 접속 IP 수" value={today.uniqueIPs} hint="이미지 생성 기준" />
        <StatTile label="오늘 게임 등록" value={today.gamesCreated} />
        <StatTile label="오늘 투표 수" value={today.votesCast} />
        <StatTile label="IP 상한 도달" value={today.ipCapHits} hint="어뷰징 의심" />
        <StatTile label="누적 게임 / 투표" value={totals.games} hint={`투표 ${totals.votes.toLocaleString("ko-KR")}`} />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">오늘 이미지 생성 결과</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(today.jobStatusCounts).length === 0 && (
            <span className="text-sm text-zinc-400">오늘 생성 시도가 없습니다.</span>
          )}
          {Object.entries(today.jobStatusCounts).map(([status, count]) => (
            <span
              key={status}
              className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium dark:border-zinc-700"
            >
              {JOB_STATUS_LABEL[status] ?? status} {count}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">최근 7일 게임 등록 추이</h3>
        <div className="flex items-end gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          {trend.map((point) => (
            <div key={point.date} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-24 w-full items-end">
                <div
                  className="w-full rounded-t bg-foreground/80"
                  style={{ height: `${(point.count / maxTrend) * 100}%`, minHeight: point.count > 0 ? "4px" : "0" }}
                />
              </div>
              <span className="text-[10px] text-zinc-400">{point.date.slice(5)}</span>
              <span className="text-xs font-medium">{point.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">오늘 생성량 상위 사용자</h3>
        {topGenerators.length === 0 ? (
          <p className="text-sm text-zinc-400">오늘 생성 기록이 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {topGenerators.map((row) => (
              <div
                key={row.clientId}
                className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-1.5 text-xs dark:border-zinc-800"
              >
                <span className="font-mono text-zinc-500">{row.clientId.slice(0, 12)}…</span>
                <span>
                  생성 {row.consumed}장 · 광고 {row.adsWatched}회
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
