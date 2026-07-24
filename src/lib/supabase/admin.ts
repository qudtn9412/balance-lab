import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

/**
 * service role 클라이언트. RLS를 우회하므로 Route Handler / 서버 전용 코드에서만 사용한다.
 * 클라이언트 컴포넌트에서 절대 import하지 말 것 ("server-only"가 빌드 타임에 이를 강제한다).
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
