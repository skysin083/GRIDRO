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
    supabase.auth.exchangeCodeForSession(window.location.href).then(({ error }) => {
      if (error) {
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
