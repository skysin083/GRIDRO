import { createClient } from "@supabase/supabase-js";

// detectSessionInUrl 기본값(true)을 켜두면 SDK가 콜백 URL의 code를 자동으로 한 번 교환하고,
// app/auth/callback/page.tsx의 수동 exchangeCodeForSession(window.location.href) 호출이
// 뒤이어 같은 code를 다시 교환하려다 실패한다. PKCE code는 1회용이라 둘 중 하나는 반드시 에러가 나고,
// 그게 우연히 SDK 쪽이 먼저 성공하면 로그인은 실제로 됐는데도 콜백 페이지는 실패 토스트를 띄운다.
// 콜백 페이지가 교환을 전담하므로 자동 감지는 꺼서 교환 시도를 하나로 못박는다.
// flowType 기본값은 'implicit'이라 명시하지 않으면 signInWithOAuth가 code_verifier를 저장하지 않는다.
// 콜백 페이지가 exchangeCodeForSession(PKCE 전용)을 쓰므로 여기서 명시적으로 'pkce'를 켜야
// 로그인 시작 시점에 code_verifier가 만들어지고 저장된다(안 그러면 콜백에서 빈 값으로 교환을
// 시도해 Supabase가 400을 반환한다).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { detectSessionInUrl: false, flowType: "pkce" } }
);
