import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminLoginForm from "./_components/AdminLoginForm";
import PendingReviewList from "./_components/PendingReviewList";
import AllGamesList from "./_components/AllGamesList";
import StatsPanel from "./_components/StatsPanel";
import FeedbackList from "./_components/FeedbackList";
import BoardCommentsAdminList from "./_components/BoardCommentsAdminList";

// usage_date/created_at 비교는 Supabase 기본 타임존(UTC) 기준 "오늘"로 계산한다.
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

  const [{ data: genRows }, { count: visitorsToday }, { count: gamesCreatedToday }, { count: totalGames }] = await Promise.all([
    supabase.from("generation_usage").select("consumed, ads_watched").eq("usage_date", todayStr),
    supabase.from("site_visits").select("*", { count: "exact", head: true }).eq("visit_date", todayStr),
    supabase.from("balance_games").select("*", { count: "exact", head: true }).gte("created_at", todayStartIso),
    supabase.from("balance_games").select("*", { count: "exact", head: true }),
  ]);

  const statsProps = {
    today: {
      visitors: visitorsToday ?? 0,
      generated: (genRows ?? []).reduce((sum, r) => sum + r.consumed, 0),
      adsWatched: (genRows ?? []).reduce((sum, r) => sum + r.ads_watched, 0),
      gamesCreated: gamesCreatedToday ?? 0,
    },
    totalGames: totalGames ?? 0,
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

  const { data: feedbackItems } = await supabase
    .from("feedback")
    .select("id, nickname, content, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: boardComments } = await supabase
    .from("board_comments")
    .select("id, nickname, content, created_at")
    .eq("status", "visible")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-12">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">통계</h1>
        </div>
        <StatsPanel {...statsProps} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">건의함</h2>
          <p className="text-sm text-zinc-500">사용자가 보낸 비공개 건의/불편사항입니다.</p>
        </div>
        <FeedbackList items={feedbackItems ?? []} />
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

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">소통게시판 관리</h2>
          <p className="text-sm text-zinc-500">신고 체계가 없는 게시판이라 삭제가 유일한 모더레이션 수단입니다.</p>
        </div>
        <BoardCommentsAdminList items={boardComments ?? []} />
      </div>
    </div>
  );
}
