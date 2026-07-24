import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import { computeBalanceScore } from "@/lib/ranking/wilson-score";
import { POLICY } from "@/config/policy";
import GameCard from "@/components/GameCard";

type Tab = "close" | "likes" | "comments";

const TABS: { key: Tab; label: string; description: string }[] = [
  { key: "close", label: "가장 어려운 밸런스", description: `투표가 ${POLICY.RANKING_MIN_VOTES}표 이상 모인 게임 중 득표율이 50:50에 가장 가까운 순서` },
  { key: "likes", label: "좋아요순", description: "좋아요를 가장 많이 받은 순서" },
  { key: "comments", label: "댓글 많은순", description: "댓글이 가장 많이 달린 순서" },
];

type GameRow = {
  slug: string;
  option_a_image_url: string;
  option_a_title: string | null;
  votes_a_count: number;
  option_b_image_url: string;
  option_b_title: string | null;
  votes_b_count: number;
  likes_count: number;
  comments_count: number;
};

function sortForTab(games: GameRow[], tab: Tab) {
  if (tab === "likes") {
    return [...games].sort((a, b) => b.likes_count - a.likes_count);
  }
  if (tab === "comments") {
    return [...games].sort((a, b) => b.comments_count - a.comments_count);
  }
  return games
    .map((game) => ({
      ...game,
      score: computeBalanceScore(game.votes_a_count, game.votes_b_count, POLICY.RANKING_MIN_VOTES),
    }))
    .filter((game): game is GameRow & { score: number } => game.score !== null)
    .sort((a, b) => b.score - a.score);
}

/**
 * 랭킹 페이지. 세 가지 탭을 지원한다:
 * - 가장 어려운 밸런스: Wilson score 기반, 최소 투표수(POLICY.RANKING_MIN_VOTES) 미만 제외
 * - 좋아요순 / 댓글 많은순: balance_games에 비정규화된 카운터 컬럼을 그대로 정렬
 * TODO: 게임 수가 많아지면 DB 정렬/페이지네이션으로 옮긴다 (현재는 애플리케이션 레벨 정렬).
 */
export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: rawTab } = await searchParams;
  const tab: Tab = rawTab === "likes" || rawTab === "comments" ? rawTab : "close";

  const supabase = createPublicClient();
  const { data: games } = await supabase
    .from("balance_games")
    .select(
      "slug, option_a_image_url, option_a_title, votes_a_count, option_b_image_url, option_b_title, votes_b_count, likes_count, comments_count",
    )
    .eq("status", "published");

  const ranked = sortForTab((games ?? []) as GameRow[], tab);
  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];

  // 탭마다 노출되는 게임 수가 달라 결과 영역 높이가 들쭉날쭉해지는 것을 막기 위해,
  // "좋아요순"/"댓글 많은순"(항상 전체 게임 노출 — 셋 중 가장 길어질 수 있는 기준)을
  // 기준으로 최소 높이를 미리 계산해 모든 탭에 동일하게 적용한다.
  const totalGames = (games ?? []).length;
  const estimatedRows = Math.max(1, Math.ceil(totalGames / 3));
  const minResultsHeight = estimatedRows * 320 + (estimatedRows - 1) * 16;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">랭킹</h1>
        <p className="text-sm text-zinc-500">{activeTab.description}</p>
      </div>

      <div className="-mx-6 flex gap-2 overflow-x-auto border-b border-zinc-200 px-6 dark:border-zinc-800">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "close" ? "/rankings" : `/rankings?tab=${t.key}`}
            className={`shrink-0 whitespace-nowrap px-3 py-2 text-sm font-medium ${
              tab === t.key
                ? "border-b-2 border-foreground text-foreground"
                : "text-zinc-500 hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div style={{ minHeight: minResultsHeight }}>
        {ranked.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {ranked.map((game, index) => (
              <GameCard
                key={game.slug}
                slug={game.slug}
                rank={index + 1}
                likesCount={game.likes_count}
                commentsCount={game.comments_count}
                optionA={{
                  imageUrl: game.option_a_image_url,
                  title: game.option_a_title,
                  votes: game.votes_a_count,
                }}
                optionB={{
                  imageUrl: game.option_b_image_url,
                  title: game.option_b_title,
                  votes: game.votes_b_count,
                }}
              />
            ))}
          </div>
        ) : (
          <div
            style={{ minHeight: minResultsHeight }}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 text-center dark:border-zinc-700"
          >
            <p className="text-sm text-zinc-500">
              {tab === "close"
                ? `아직 투표가 ${POLICY.RANKING_MIN_VOTES}표 이상 모인 밸런스게임이 없습니다.`
                : "아직 등록된 밸런스게임이 없습니다."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
