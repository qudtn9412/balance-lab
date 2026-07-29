import BackButton from "@/components/BackButton";
import FeedbackForm from "./_components/FeedbackForm";
import MyFeedbackList from "./_components/MyFeedbackList";
import { readClientId } from "@/lib/client-id";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 무가입 서비스라 계정으로 "내 건의"를 묶을 수 없어서, client_id 쿠키로 본인 글만 필터링한다
 * (my-games와 동일한 패턴). RLS가 anon select를 막아둔 테이블이라 admin client로 조회한다.
 */
export default async function FeedbackPage() {
  const clientId = await readClientId();
  const supabase = createAdminClient();

  const { data: myFeedback } = clientId
    ? await supabase
        .from("feedback")
        .select("id, content, status, created_at, admin_reply")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-6 py-12">
      <BackButton />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">불편접수하기</h1>
          <p className="text-sm text-zinc-500">불편한 점이나 원하는 기능을 남겨주세요. 공개되지 않고 운영자만 확인합니다.</p>
        </div>
        <FeedbackForm />
      </div>

      <MyFeedbackList items={myFeedback ?? []} />
    </div>
  );
}
