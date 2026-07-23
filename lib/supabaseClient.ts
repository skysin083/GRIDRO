import { createClient } from "@supabase/supabase-js";

// flowType을 명시하지 않아 SDK 기본값인 'implicit'을 쓴다 — 콜백 URL에 ?code=가 아니라
// #access_token=... 해시로 세션이 온다. detectSessionInUrl 기본값(true)이 이 해시를
// 자동으로 감지해 세션을 만들어주므로, app/auth/callback/page.tsx는 그 결과만 기다리면
// 된다(AU-2 참고 — 예전엔 PKCE 전용인 exchangeCodeForSession을 여기 맞지 않게 수동
// 호출해서 로그인 성공 여부가 자동 감지와의 경쟁에 우연히 달려 있었다).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
