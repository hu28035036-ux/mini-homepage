import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 서버 전용 Supabase 클라이언트.
// 서비스 롤 키를 사용하므로 절대 클라이언트로 노출하지 말 것.
// 모든 호출은 repository 레이어를 거치며, repository가 user_id + deleted_at IS NULL 필터를 강제한다.

let _client: SupabaseClient | null = null;

export function supabaseServer(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      '[supabaseServer] SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다. .env.local을 확인하세요.'
    );
  }

  _client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return _client;
}
