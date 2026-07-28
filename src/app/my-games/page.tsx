import Link from "next/link";
import { readClientId } from "@/lib/client-id";
import { createAdminClient } from "@/lib/supabase/admin";
import GameCard from "@/components/GameCard";

const STATUS_LABEL: Record<string, string> = {
  hidden: "비공개",
  pending_review: "검토 중",
};

/**
 * 회원가입이 없어서 "마이페이지"가 존재하지 않는데, 자기가 만든 게임을 다시 찾을 방법도 없었다.
 * client_id 쿠키만으로 본인 게임을 조회한다 — 다른 사람 것은 볼 수 없고(쿠키는 httpOnly라 위조
 * 불가), 비공개/검토중 상태여도 본인 것이면 보여준다(RLS가 막는 select라 admin client 사용).
 */
export default async function MyGamesPage() {
  const clientId = await readClientId();
  const supabase = createAdminClient();

  const { data: games } = clientId
    ? await supabase
        .from("balance_games")
        .select(
          "slug, creator_nickname, option_a_image_url, option_a_title, votes_a_count, option_b_image_url, option_b_title, votes_b_count, likes_count, comments_count, status, created_at",
        )
        .eq("creator_client_id", clientId)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">내가 만든 게임</h1>
        <p className="text-sm text-zinc-500">이 브라우저(쿠키) 기준으로 만든 게임만 보여줍니다. 쿠키를 지우면 목록이 초기화돼요.</p>
      </div>

      {games && games.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {games.map((game) => (
            <div key={game.slug} className="relative">
              {STATUS_LABEL[game.status] && (
                <span className="absolute right-2 top-2 z-10 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white">
                  {STATUS_LABEL[game.status]}
                </span>
              )}
              <GameCard
                slug={game.slug}
                creatorNickname={game.creator_nickname}
                likesCount={game.likes_count}
                commentsCount={game.comments_count}
                optionA={{ imageUrl: game.option_a_image_url, title: game.option_a_title, votes: game.votes_a_count }}
                optionB={{ imageUrl: game.option_b_image_url, title: game.option_b_title, votes: game.votes_b_count }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 text-center dark:border-zinc-700">
          <span className="text-2xl">📭</span>
          <p className="text-sm font-medium">아직 만든 게임이 없어요</p>
          <Link href="/games/new" className="text-sm font-medium underline">
            지금 만들어보기
          </Link>
        </div>
      )}
    </div>
  );
}
