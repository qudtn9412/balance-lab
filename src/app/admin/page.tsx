import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { POLICY } from "@/config/policy";
import AdminLoginForm from "./_components/AdminLoginForm";
import PendingReviewList from "./_components/PendingReviewList";
import AllGamesList from "./_components/AllGamesList";
import StatsPanel from "./_components/StatsPanel";

const TREND_DAYS = 7;

// usage_date/created_at 비교는 Supabase 기본 타임존(UTC) 기준 "오늘"로 계산한다.
// 방문자 트래픽(페이지뷰) 자체는 이 DB에 없는 정보라 다루지 않고, 실제로 생성/투표 등
// 행동으로 이어진 사용자 수만 집계한다 — 순수 트래픽은 Vercel Analytics/GA 쪽 몫이다.
function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    return <AdminLoginForm />;
  }

  const supabase = createAdminClient();

  const now = new Date();
  const todayStr = toDateStr(now);
  const todayStartIso = `${todayStr}T00:00:00.000Z`;
  const trendStartStr = toDateStr(new Date(now.getTime() - (TREND_DAYS - 1) * 86_400_000));
  const trendStartIso = `${trendStartStr}T00:00:00.000Z`;

  const [
    { data: genRows },
    { data: ipRows },
    { count: gamesCreatedToday },
    { count: votesCastToday },
    { data: jobRows },
    { data: trendGameRows },
    { count: totalGames },
    { count: totalVotes },
  ] = await Promise.all([
    supabase.from("generation_usage").select("client_id, consumed, granted_bonus, ads_watched").eq("usage_date", todayStr),
    supabase.from("ip_generation_usage").select("ip_address, consumed").eq("usage_date", todayStr),
    supabase.from("balance_games").select("*", { count: "exact", head: true }).gte("created_at", todayStartIso),
    supabase.from("votes").select("*", { count: "exact", head: true }).gte("created_at", todayStartIso),
    supabase.from("image_generation_jobs").select("status").gte("created_at", todayStartIso),
    supabase.from("balance_games").select("created_at").gte("created_at", trendStartIso),
    supabase.from("balance_games").select("*", { count: "exact", head: true }),
    supabase.from("votes").select("*", { count: "exact", head: true }),
  ]);

  const jobStatusCounts: Record<string, number> = {};
  for (const job of jobRows ?? []) {
    jobStatusCounts[job.status] = (jobStatusCounts[job.status] ?? 0) + 1;
  }

  const trendBuckets = new Map<string, number>();
  for (let i = 0; i < TREND_DAYS; i++) {
    trendBuckets.set(toDateStr(new Date(now.getTime() - i * 86_400_000)), 0);
  }
  for (const game of trendGameRows ?? []) {
    const day = game.created_at.slice(0, 10);
    if (trendBuckets.has(day)) trendBuckets.set(day, (trendBuckets.get(day) ?? 0) + 1);
  }
  const trend = [...trendBuckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }));

  const topGenerators = [...(genRows ?? [])]
    .sort((a, b) => b.consumed - a.consumed)
    .slice(0, 10)
    .map((row) => ({ clientId: row.client_id, consumed: row.consumed, adsWatched: row.ads_watched }));

  const statsProps = {
    today: {
      generated: (genRows ?? []).reduce((sum, r) => sum + r.consumed, 0),
      activeClients: (genRows ?? []).length,
      adsWatched: (genRows ?? []).reduce((sum, r) => sum + r.ads_watched, 0),
      uniqueIPs: (ipRows ?? []).length,
      ipCapHits: (ipRows ?? []).filter((r) => r.consumed >= POLICY.IP_DAILY_GENERATION_CAP).length,
      gamesCreated: gamesCreatedToday ?? 0,
      votesCast: votesCastToday ?? 0,
      jobStatusCounts,
    },
    topGenerators,
    trend,
    totals: { games: totalGames ?? 0, votes: totalVotes ?? 0 },
  };
  const { data: games } = await supabase
    .from("balance_games")
    .select("slug, option_a_image_url, option_a_title, option_b_image_url, option_b_title, id")
    .eq("status", "pending_review")
    .order("created_at", { ascending: false });

  const gameIds = (games ?? []).map((g) => g.id);
  const { data: reports } = gameIds.length
    ? await supabase.from("reports").select("target_id").eq("target_type", "game").in("target_id", gameIds)
    : { data: [] as { target_id: string }[] };

  const reportCounts = new Map<string, number>();
  for (const report of reports ?? []) {
    reportCounts.set(report.target_id, (reportCounts.get(report.target_id) ?? 0) + 1);
  }

  const pendingReviewRows = (games ?? []).map((game) => ({
    slug: game.slug,
    option_a_image_url: game.option_a_image_url,
    option_a_title: game.option_a_title,
    option_b_image_url: game.option_b_image_url,
    option_b_title: game.option_b_title,
    reportCount: reportCounts.get(game.id) ?? 0,
  }));

  const { data: allGames } = await supabase
    .from("balance_games")
    .select(
      "slug, option_a_image_url, option_a_title, option_b_image_url, option_b_title, votes_a_count, votes_b_count, likes_count, comments_count, created_at",
    )
    .neq("status", "pending_review")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-12">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">통계</h1>
          <p className="text-sm text-zinc-500">방문자(페이지뷰) 자체는 별도 트래픽 분석 도구가 필요하고, 아래는 이 서비스 DB에 있는 생성/투표/광고 데이터 기준입니다.</p>
        </div>
        <StatsPanel {...statsProps} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">신고 검토</h2>
          <p className="text-sm text-zinc-500">신고 누적으로 자동 비공개된 게임 목록입니다. 검토 후 복원하거나 완전 삭제하세요.</p>
        </div>
        <PendingReviewList games={pendingReviewRows} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">전체 게임 관리</h2>
        </div>
        <AllGamesList games={allGames ?? []} />
      </div>
    </div>
  );
}
