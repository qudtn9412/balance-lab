import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import GameCard from "@/components/GameCard";

const FEED_PAGE_SIZE = 30;

export default async function Home() {
  const supabase = createPublicClient();
  const { data: games } = await supabase
    .from("balance_games")
    .select(
      "slug, option_a_image_url, option_a_title, votes_a_count, option_b_image_url, option_b_title, votes_b_count, likes_count, comments_count",
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(FEED_PAGE_SIZE);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-bold">밸런스랩</h1>
        <p className="max-w-lg text-balance text-zinc-600 dark:text-zinc-400">
          프롬프트 2개로 이미지를 만들고, 밸런스게임으로 등록해 투표를 받아보세요.
        </p>
        <Link
          href="/games/new"
          className="rounded-full bg-foreground px-6 py-3 font-medium text-background"
        >
          밸런스게임 만들기
        </Link>
      </div>

      {games && games.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {games.map((game) => (
            <GameCard
              key={game.slug}
              slug={game.slug}
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
        <p className="text-center text-sm text-zinc-500">아직 등록된 밸런스게임이 없습니다. 첫 번째로 만들어보세요!</p>
      )}
    </div>
  );
}
