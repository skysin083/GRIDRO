"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
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
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  if (loading || user) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] grid md:grid-cols-2">
      {/* 좌: 브랜드 비주얼 영역 — 데스크톱에서만, 기존 디자인 시스템 primary 톤 */}
      <div className="hidden md:flex flex-col justify-center px-16 bg-primary-500 text-white">
        <span className="text-h3 font-bold">GRIDRO</span>
        <p className="mt-4 text-[28px] leading-[1.4] font-bold">
          그림 프리랜서를 위한
          <br />
          가장 빠른 이력서
        </p>
        <p className="mt-3 text-body-sm text-white/80">백지 대신 질문지로, 3분이면 완성돼요.</p>
      </div>

      {/* 우: 로그인 영역 — 이메일/비밀번호 없이 Google 버튼 하나 */}
      <div className="flex flex-col items-center justify-center px-6 py-20 gap-8">
        <span className="md:hidden text-h3 font-bold text-primary-500">GRIDRO</span>
        <div className="text-center space-y-2">
          <h1 className="text-title font-bold text-neutral-900">로그인</h1>
          <p className="text-body-sm text-neutral-500">Google 계정으로 간편하게 시작하세요</p>
        </div>
        <Button variant="outline" size="lg" className="w-full max-w-[320px] gap-2" onClick={handleGoogleLogin}>
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
