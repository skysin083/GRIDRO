"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/Toast";
import { consumeAuthNext } from "@/lib/authRedirect";

// next 파라미터를 더는 URL 쿼리스트링으로 받지 않아(app/login/page.tsx 참고) useSearchParams가
// 필요 없다 — Suspense 경계도 같이 걷어냈다.
export default function AuthCallbackPage() {
  const router = useRouter();
  const toast = useToast();
  // PKCE code는 한 번만 교환할 수 있다 — 이 effect가 두 번 실행되면(StrictMode 재마운트 등)
  // 두 번째 호출이 실패로 처리돼 이미 로그인은 성공했는데 실패 토스트가 뜨는 원인이 됐다.
  // ref로 실제 교환 시도를 한 번으로 못박는다.
  const exchangedRef = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (exchangedRef.current) return;
    exchangedRef.current = true;
    supabase.auth.exchangeCodeForSession(window.location.href).then(async ({ error }) => {
      if (error) {
        // 수동 교환이 SDK의 자동 세션 감지(detectSessionInUrl 기본값)와 경합해 "invalid flow
        // state"로 실패해도, 세션 자체는 이미 만들어졌을 수 있다(lib/supabaseClient.ts 참고).
        // 실제로 로그인된 상태인지 다시 확인해서, 세션이 있으면 조용히 성공 취급한다 —
        // 로그인은 됐는데 "실패했어요" 토스트가 뜨는 오탐을 없앤다. login_completed 이벤트는
        // 여기가 아니라 AuthListener의 onAuthStateChange(SIGNED_IN)에서 쏜다 — 이 수동 교환이
        // 이겼는지 자동 감지가 이겼는지와 무관하게 항상 한 번만 발생한다.
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          router.replace(consumeAuthNext());
          return;
        }
        console.error("[login] exchangeCodeForSession failed:", error.message, error);
        setFailed(true);
        toast.show("로그인에 실패했어요. 다시 시도해 주세요", "danger");
        router.replace("/login");
        return;
      }
      // 존재하지 않는 라우트로 가지 않도록 consumeAuthNext가 허용된 경로인지 확인한 값만 돌려준다.
      router.replace(consumeAuthNext());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) return null;
  return <p className="text-center text-body-sm text-neutral-400 py-20">로그인 처리 중…</p>;
}
