import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

/**
 * anon key 클라이언트. RLS 정책상 공개된(status='published' 등) 행의 select만 가능해야 한다.
 * 클라이언트/서버 컴포넌트 어디서든 사용 가능하지만 쓰기 작업에는 쓰지 않는다.
 */
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}
