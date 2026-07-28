type TodayStats = {
  visitors: number;
  generated: number;
  adsWatched: number;
  gamesCreated: number;
};

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-2xl font-bold">{value.toLocaleString("ko-KR")}</p>
    </div>
  );
}

export default function StatsPanel({ today, totalGames }: { today: TodayStats; totalGames: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <StatTile label="오늘 방문자수" value={today.visitors} />
      <StatTile label="오늘 이미지 생성" value={today.generated} />
      <StatTile label="오늘 광고 시청" value={today.adsWatched} />
      <StatTile label="오늘 게임 등록" value={today.gamesCreated} />
      <StatTile label="누적 게임 등록" value={totalGames} />
    </div>
  );
}
