import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import { createAdminClient } from "@/lib/supabase/admin";
import { readClientId } from "@/lib/client-id";
import BackButton from "@/components/BackButton";
import VoteSection from "./_components/VoteSection";
import CommentSection from "./_components/CommentSection";
import ReportButton from "./_components/ReportButton";
import LikeButton from "./_components/LikeButton";
import ShareButton from "./_components/ShareButton";

type Params = { params: Promise<{ slug: string }> };

/**
 * 공유 링크로 퍼졌을 때 카카오톡/트위터 등에서 미리보기가 뜨도록 게임별 메타데이터를 채운다.
 * 이 서비스의 핵심 성장 동력이 "공유"이므로 og:title/og:image가 비어있으면 안 된다.
 */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicClient();
  const { data: game } = await supabase
    .from("balance_games")
    .select("option_a_title, option_b_title, option_a_image_url")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!game) {
    return { title: "밸런스랩" };
  }

  const title = `${game.option_a_title ?? "옵션 A"} vs ${game.option_b_title ?? "옵션 B"}`;
  const description = "지금 투표하고 다른 사람들의 선택도 확인해보세요.";

  return {
    title,
    description,
    openGraph: { title, description, images: [game.option_a_image_url] },
  };
}

/**
 * 게임 상세: 이미지 2장 + 투표 UI + 댓글.
 * "이미 투표했는가"는 anon key로는 확인할 수 없다(votes 테이블은 개별 투표 노출을 막기 위해
 * anon select를 차단해뒀다) — service role로 서버에서 미리 확인해 클라이언트에 내려준다.
 */
export default async function GamePage({ params }: Params) {
  const { slug } = await params;
  const publicSupabase = createPublicClient();

  const { data: game } = await publicSupabase
    .from("balance_games")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!game) {
    notFound();
  }

  const { data: comments } = await publicSupabase
    .from("comments")
    .select("id, content, nickname, created_at, client_id")
    .eq("game_id", game.id)
    .eq("status", "visible")
    .order("created_at", { ascending: false });

  const clientId = await readClientId();

  // 댓글의 client_id는 소유권 판별용일 뿐 클라이언트에 그대로 노출하면 다른 사람의 익명 식별자가
  // 유출되므로, 여기서 "내 댓글인지" 여부만 boolean으로 계산하고 client_id 자체는 제거한다.
  const commentsForClient = (comments ?? []).map(({ client_id: commentClientId, ...rest }) => ({
    ...rest,
    isMine: clientId !== null && commentClientId === clientId,
  }));
  let myChoice: "a" | "b" | null = null;
  let liked = false;
  if (clientId) {
    const adminSupabase = createAdminClient();
    const [{ data: existingVote }, { data: existingLike }] = await Promise.all([
      adminSupabase
        .from("votes")
        .select("choice")
        .eq("game_id", game.id)
        .eq("voter_client_id", clientId)
        .maybeSingle(),
      adminSupabase
        .from("likes")
        .select("id")
        .eq("game_id", game.id)
        .eq("client_id", clientId)
        .maybeSingle(),
    ]);
    // votes.choice는 DB에 CHECK 제약(choice in ('a','b'))만 있고 실제 enum 타입이 아니라
    // 생성된 타입에서는 그냥 string으로 잡힌다 — 애플리케이션 레벨에서 좁혀준다.
    myChoice = (existingVote?.choice ?? null) as "a" | "b" | null;
    liked = existingLike !== null;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <BackButton />
        <div className="flex items-center gap-2">
          <LikeButton slug={slug} initialLiked={liked} initialCount={game.likes_count} />
          <ShareButton />
          <ReportButton slug={slug} />
        </div>
      </div>

      <p className="-mt-4 text-xs text-zinc-400">
        제작자:{" "}
        {game.creator_nickname ? (
          <Link href={`/?creator=${encodeURIComponent(game.creator_nickname)}`} className="underline hover:text-foreground">
            {game.creator_nickname}
          </Link>
        ) : (
          "익명"
        )}
      </p>

      <VoteSection
        slug={slug}
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
        initialChoice={myChoice}
      />

      <CommentSection slug={slug} initialComments={commentsForClient} />
    </div>
  );
}
