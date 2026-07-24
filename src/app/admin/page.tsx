import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminLoginForm from "./_components/AdminLoginForm";
import PendingReviewList from "./_components/PendingReviewList";
import AllGamesList from "./_components/AllGamesList";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    return <AdminLoginForm />;
  }

  const supabase = createAdminClient();
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
          <h1 className="text-2xl font-bold">신고 검토</h1>
          <p className="text-sm text-zinc-500">신고 누적으로 자동 비공개된 게임 목록입니다. 검토 후 복원하거나 완전 삭제하세요.</p>
        </div>
        <PendingReviewList games={pendingReviewRows} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">전체 게임 관리</h2>
          <p className="text-sm text-zinc-500">테스트로 만든 게임 등 필요 없는 데이터를 여기서 바로 삭제할 수 있습니다.</p>
        </div>
        <AllGamesList games={allGames ?? []} />
      </div>
    </div>
  );
}
