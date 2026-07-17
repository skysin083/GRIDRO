"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/Toast";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const next = searchParams.get("next") ?? "/my";
  // PKCE code는 한 번만 교환할 수 있다 — 이 effect가 두 번 실행되면(StrictMode 재마운트 등)
  // 두 번째 호출이 실패로 처리돼 이미 로그인은 성공했는데 실패 토스트가 뜨는 원인이 됐다.
  // ref로 실제 교환 시도를 한 번으로 못박는다.
  const exchangedRef = useRef(false);

  useEffect(() => {
    if (exchangedRef.current) return;
    exchangedRef.current = true;
    supabase.auth.exchangeCodeForSession(window.location.href).then(({ error }) => {
      if (error) {
        toast.show("로그인에 실패했어요. 다시 시도해 주세요", "danger");
        router.replace("/login");
        return;
      }
      router.replace(next);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <p className="text-center text-body-sm text-neutral-400 py-20">로그인 처리 중…</p>;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackInner />
    </Suspense>
  );
}
