import { createClient } from "@supabase/supabase-js";

// flowType을 'pkce'로, detectSessionInUrl을 false로 강제했더니 이 프로젝트에서 수동
// exchangeCodeForSession이 "invalid flow state" 에러로 항상 실패하는 게 드러났다(로컬/배포 동일).
// 반대로 detectSessionInUrl 기본값(true)에서는 SDK가 콜백 URL의 code를 자동으로 감지해
// 조용히 세션을 만들어준다 — 콜백 페이지의 수동 호출과 경합해 가끔 "로그인 성공했는데 실패
// 토스트" 같은 사소한 오탐이 날 수는 있지만, 로그인 자체는 항상 된다. 완전히 고치는 것보다
// 실제로 되는 쪽을 우선한다 — 기본값 그대로 둔다.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
