// 로그인 후 돌아갈 목적지를 Supabase OAuth 리다이렉트의 쿼리스트링으로 왕복시키지 않는다 —
// Supabase가 redirectTo에 자체 code 파라미터를 덧붙이는 과정에서 우리 쿼리와 뒤섞여
// next 값이 깨지면(예: "/my" 대신 임의 문자열) 콜백 직후 존재하지 않는 라우트로 이동해 404가 났다.
// sessionStorage로 브라우저 안에서만 들고 있으면 이 왕복 자체가 없어진다.
const STORAGE_KEY = "gridro:auth-next";

// useRequireAuth가 만들 수 있는 목적지만 허용 — 그 외 값(깨진 값 포함)은 /my로 보낸다.
const ALLOWED_NEXT_PATHS = ["/my", "/account", "/write"];

export function saveAuthNext(next: string) {
  sessionStorage.setItem(STORAGE_KEY, next);
}

export function consumeAuthNext(): string {
  const next = sessionStorage.getItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  return next && ALLOWED_NEXT_PATHS.includes(next) ? next : "/my";
}
