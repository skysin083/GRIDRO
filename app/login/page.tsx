"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import { saveAuthNext } from "@/lib/authRedirect";
import { track } from "@/lib/mixpanel";
import Button from "@/components/ui/Button";

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
    // AM-2(개정): 좌우 분할 대신 단일 컬럼 중앙 정렬 — 좌측 브랜드 영역은 제거.
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-[400px] text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg?v=3" alt="GRIDRO" className="h-7 w-auto mx-auto mb-12" />
        <h1 className="text-[28px] md:text-[32px] font-bold text-neutral-900 mb-3">로그인</h1>
        <p className="text-[14px] md:text-[16px] leading-[1.5] text-neutral-500 mb-6">
          Google 계정으로 간편하게 시작하세요
        </p>
        <Button variant="outline" size="lg" className="w-full gap-2" onClick={handleGoogleLogin}>
          <GoogleIcon />
          Google로 계속하기
        </Button>
      </div>
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
