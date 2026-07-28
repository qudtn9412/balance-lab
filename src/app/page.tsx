import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import GameCard from "@/components/GameCard";
import CreatorSearchForm from "@/components/CreatorSearchForm";

const FEED_PAGE_SIZE = 30;

type Sort = "new" | "popular";

function buildHref(sort: Sort, creator?: string): string {
  const params = new URLSearchParams();
  if (sort === "popular") params.set("sort", "popular");
  if (creator) params.set("creator", creator);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; creator?: string }>;
}) {
  const { sort: rawSort, creator } = await searchParams;
  const sort: Sort = rawSort === "popular" ? "popular" : "new";

  const supabase = createPublicClient();

  let gamesQuery = supabase
    .from("balance_games")
    .select(
      "slug, creator_nickname, option_a_image_url, option_a_title, votes_a_count, option_b_image_url, option_b_title, votes_b_count, likes_count, comments_count",
    )
    .eq("status", "published")
    .order(sort === "popular" ? "likes_count" : "created_at", { ascending: false })
    .limit(FEED_PAGE_SIZE);
  let countQuery = supabase.from("balance_games").select("*", { count: "exact", head: true }).eq("status", "published");

  if (creator) {
    gamesQuery = gamesQuery.eq("creator_nickname", creator);
    countQuery = countQuery.eq("creator_nickname", creator);
  }

  const [{ data: games }, { count: totalCount }] = await Promise.all([gamesQuery, countQuery]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-bold">밸런스랩</h1>
        <p className="max-w-lg text-balance text-zinc-600 dark:text-zinc-400">
          프롬프트 2개로 이미지를 만들고, 밸런스게임으로 등록해 투표를 받아보세요.
        </p>
        <Link
          href="/games/new"
          className="rounded-full bg-foreground px-6 py-3 font-medium text-background transition hover:opacity-90"
        >
          밸런스게임 만들기
        </Link>
        {!creator && typeof totalCount === "number" && totalCount > 0 && (
          <p className="text-xs text-zinc-400">지금까지 {totalCount}개의 밸런스게임이 등록됐어요</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-2 dark:border-zinc-800">
        <div className="flex gap-2">
          <Link
            href={buildHref("new", creator)}
            className={
              sort === "new"
                ? "border-b-2 border-foreground px-3 py-2 text-sm font-medium text-foreground"
                : "px-3 py-2 text-sm font-medium text-zinc-500 hover:text-foreground"
            }
          >
            최신순
          </Link>
          <Link
            href={buildHref("popular", creator)}
            className={
              sort === "popular"
                ? "border-b-2 border-foreground px-3 py-2 text-sm font-medium text-foreground"
                : "px-3 py-2 text-sm font-medium text-zinc-500 hover:text-foreground"
            }
          >
            인기순
          </Link>
        </div>
        <CreatorSearchForm initialValue={creator} />
      </div>

      {creator && (
        <div className="-mt-4 flex items-center justify-between gap-2 text-sm">
          <span>
            <strong>{creator}</strong>님이 만든 게임 {totalCount ?? 0}개
            <span className="ml-1 text-xs text-zinc-400">(같은 닉네임 기준, 본인 확인은 아니에요)</span>
          </span>
          <Link href="/" className="shrink-0 text-xs text-zinc-500 underline hover:text-foreground">
            필터 해제
          </Link>
        </div>
      )}

      {games && games.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {games.map((game) => (
            <GameCard
              key={game.slug}
              slug={game.slug}
              creatorNickname={game.creator_nickname}
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
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 text-center dark:border-zinc-700">
          <span className="text-2xl">🎲</span>
          <p className="text-sm font-medium">
            {creator ? `"${creator}" 닉네임으로 만든 게임이 없습니다` : "아직 등록된 밸런스게임이 없습니다"}
          </p>
          {!creator && <p className="text-xs text-zinc-500">첫 번째로 만들어보세요!</p>}
        </div>
      )}
    </div>
  );
}
