"use client";

import { Suspense, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import { saveAuthNext } from "@/lib/authRedirect";
import { isLikelyInAppBrowser } from "@/lib/inAppBrowser";
import { track } from "@/lib/mixpanel";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const FEEDBACK_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdSwJGKrL3EPtypo_AZP2QOpiycC9Lx_G6bFC74jFiDWcfIBg/viewform?usp=header";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.87-3.04.87-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.73A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.19.29-1.73V4.94H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.06l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const next = searchParams.get("next") ?? "/my";
  // AU-1: 트위터 등 인앱 브라우저에서는 Google이 OAuth 자체를 차단한다(disallowed_useragent) —
  // 버튼을 눌러도 항상 실패한다. 트위터(t.co) 쪽은 UA로 못 잡고 리퍼러로만 추정 가능해
  // (lib/inAppBrowser.ts 참고) 오탐 가능성이 있으므로, 버튼을 없애는 대신 위에 안내만
  // 덧붙인다 — 오탐이어도 버튼은 그대로 눌러서 로그인할 수 있다.
  // navigator/document는 서버에 없어 값이 서버/클라이언트 간 다를 수 있는 전형적인 케이스라
  // useSyncExternalStore로 읽는다 — 서버 스냅샷은 항상 false라 하이드레이션 불일치가 안 난다.
  // 값 자체가 마운트 중 변할 일이 없어 구독은 no-op으로 둔다.
  const inAppBrowser = useSyncExternalStore(
    () => () => {},
    () => isLikelyInAppBrowser(),
    () => false
  );

  // 이미 로그인된 상태로 /login에 들어오면(뒤로가기 등) 바로 목적지로 보낸다.
  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, next, router]);

  const handleGoogleLogin = () => {
    track("login_started");
    // next는 sessionStorage로 넘긴다 — redirectTo에 쿼리스트링으로 실어 보내면 Supabase가
    // 자체 code 파라미터를 붙이는 과정에서 뒤섞여 콜백 후 404로 이어졌다.
    saveAuthNext(next);
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  if (loading || user) return null;

  return (
    // AO(개정): 상단 로고 바 + 카드 컨테이너 + 하단 푸터 — 좌우 2컬럼 분할은 폐기.
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* AO-1: 로고만 있는 얇은 바(메뉴 없음), 중앙 정렬 */}
      <header className="h-14 md:h-16 shrink-0 flex items-center justify-center">
        <Link href="/" aria-label="GRIDRO 홈으로">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg?v=3" alt="GRIDRO" className="h-6 md:h-7 w-auto" />
        </Link>
      </header>

      {/* AO-2: 카드는 화면 중앙보다 약간 위 — 남은 세로 공간을 4:6 비율 spacer로 나눠 잡는다 */}
      <div className="flex-1 flex flex-col items-center px-5">
        <div className="flex-[4]" />
        <Card hover="none" className="w-full max-w-none md:max-w-[400px] py-10 px-8 text-center">
          <h1 className="text-h1 font-bold text-neutral-900 mb-3">로그인</h1>
          <p className="text-body-sm text-neutral-500 mb-6">Google 계정으로 간편하게 시작하세요</p>
          {inAppBrowser && (
            <div className="rounded-md bg-primary-50 border border-primary-200 px-4 py-3 text-left space-y-1 mb-3">
              <p className="text-body-sm font-semibold text-primary-700">
                지금 보고 계신 앱 내 브라우저에서는 Google 로그인이 제한될 수 있어요
              </p>
              <p className="text-caption text-primary-600">
                로그인이 안 되면 우측 상단 <span className="font-semibold">&lsquo;···&rsquo;</span> 또는 공유
                버튼에서 <span className="font-semibold">&lsquo;Safari(다른 브라우저)에서 열기&rsquo;</span>를
                선택한 뒤 다시 시도해 주세요.
              </p>
            </div>
          )}
          <Button variant="outline" size="lg" className="w-full gap-2" onClick={handleGoogleLogin}>
            <GoogleIcon />
            Google로 계속하기
          </Button>
          <p className="text-caption text-neutral-400 mt-6">
            로그인하면{" "}
            <Link href="/terms" className="text-neutral-500 hover:text-neutral-700 transition-colors">
              이용약관
            </Link>
            과{" "}
            <Link href="/privacy" className="text-neutral-500 hover:text-neutral-700 transition-colors">
              개인정보처리방침
            </Link>
            에 동의한 것으로 봐요.
          </p>
        </Card>
        <div className="flex-[6]" />
      </div>

      {/* AO-4: 하단 푸터 — 얇고 조용하게 */}
      <footer className="shrink-0 px-5 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 max-w-[480px] mx-auto text-caption text-neutral-400">
          <span>© 2026 GRIDRO</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-neutral-600 transition-colors">
              이용약관
            </Link>
            <Link href="/privacy" className="hover:text-neutral-600 transition-colors">
              개인정보처리방침
            </Link>
            <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className="hover:text-neutral-600 transition-colors">
              의견 보내기
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
