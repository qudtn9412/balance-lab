import { createPublicClient } from "@/lib/supabase/public";
import { readClientId } from "@/lib/client-id";
import BackButton from "@/components/BackButton";
import BoardCommentSection from "./_components/BoardCommentSection";

const BOARD_PAGE_SIZE = 100;

export default async function BoardPage() {
  const supabase = createPublicClient();
  const clientId = await readClientId();

  const { data: comments } = await supabase
    .from("board_comments")
    .select("id, content, nickname, created_at, client_id")
    .eq("status", "visible")
    .order("created_at", { ascending: false })
    .limit(BOARD_PAGE_SIZE);

  // 다른 사람의 익명 식별자를 그대로 노출하지 않도록, 여기서 "내 글인지" boolean만 계산하고
  // client_id 자체는 클라이언트로 내려보내지 않는다 (게임 상세 댓글과 동일한 원칙).
  const commentsForClient = (comments ?? []).map(({ client_id: commentClientId, ...rest }) => ({
    ...rest,
    isMine: clientId !== null && commentClientId === clientId,
  }));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <BackButton />
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">소통게시판</h1>
        <p className="text-sm text-zinc-500">밸런스게임과 상관없이 자유롭게 떠드는 공간이에요.</p>
      </div>
      <BoardCommentSection initialComments={commentsForClient} />
    </div>
  );
}
