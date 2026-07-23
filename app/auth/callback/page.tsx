"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/Toast";
import { consumeAuthNext } from "@/lib/authRedirect";

// 콜백 URL의 세션 감지를 기다리는 최대 시간 — 이 안에 세션이 안 잡히면 진짜 실패로 본다.
const SESSION_WAIT_TIMEOUT_MS = 5000;

// next 파라미터를 더는 URL 쿼리스트링으로 받지 않아(app/login/page.tsx 참고) useSearchParams가
// 필요 없다 — Suspense 경계도 같이 걷어냈다.
//
// AU-2(버그수정): 예전엔 여기서 supabase.auth.exchangeCodeForSession()을 수동 호출했는데,
// 이 메서드는 PKCE 플로우 전용(콜백 URL의 ?code= 파라미터를 code_verifier와 교환)이다.
// 이 프로젝트의 클라이언트(lib/supabaseClient.ts)는 flowType을 명시하지 않아 SDK 기본값인
// 'implicit'을 쓰는데, implicit 플로우의 콜백 URL은 ?code=가 아니라 #access_token=... 해시로
// 온다 — 즉 exchangeCodeForSession은 이 프로젝트 구조상 항상 실패하도록 되어 있었다.
// 로그인이 그동안 "된 것처럼" 보인 건, SDK가 detectSessionInUrl(기본값 true)로 그 해시를
// 자동으로 먼저 파싱해 세션을 만드는 경우가 많았고, 수동 호출이 실패해도 그 뒤 getSession()
// fallback이 이미 만들어진 세션을 발견해 조용히 성공 처리했기 때문이다 — 즉 이 페이지의
// 로그인 성공 여부가 "자동 감지가 수동 호출보다 먼저 끝나는가"라는 우연한 경쟁에 달려 있었다.
// Safari 계열에서 이 경쟁이 다르게(더 늦게) 풀리면서 로그인 완료율이 0%로 떨어지는 게 실측됐다.
// 이제 애초에 성립할 수 없는 수동 교환 호출을 걷어내고, SDK가 이미 잘 해내고 있는 자동 해시
// 감지 결과만 기다린다 — onAuthStateChange(SIGNED_IN)로 즉시 반응하되, 마운트 시점에 감지가
// 이미 끝나 있었을 경우를 대비해 getSession()도 한 번 확인하고, 둘 다 실패하면 타임아웃 후에만
// 진짜 실패로 처리한다.
export default function AuthCallbackPage() {
  const router = useRouter();
  const toast = useToast();
  const settledRef = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const settle = (hasSession: boolean) => {
      if (settledRef.current) return;
      settledRef.current = true;
      if (hasSession) {
        // 존재하지 않는 라우트로 가지 않도록 consumeAuthNext가 허용된 경로인지 확인한 값만 돌려준다.
        router.replace(consumeAuthNext());
        return;
      }
      console.error("[login] 콜백에서 세션 감지 실패 (timeout)");
      setFailed(true);
      toast.show("로그인에 실패했어요. 다시 시도해 주세요", "danger");
      router.replace("/login");
    };

    // login_completed 이벤트는 여기가 아니라 AuthListener의 onAuthStateChange(SIGNED_IN)에서
    // 쏜다 — 세션이 언제 어떻게 감지되든 항상 정확히 한 번만 발생한다.
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) settle(true);
    });

    // 이 effect가 붙기 전에 자동 감지가 이미 끝나 있었을 수도 있으니 한 번 즉시 확인한다.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) settle(true);
    });

    const timer = setTimeout(() => settle(false), SESSION_WAIT_TIMEOUT_MS);

    return () => {
      subscription.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [router, toast]);

  if (failed) return null;
  return <p className="text-center text-body-sm text-neutral-400 py-20">로그인 처리 중…</p>;
}
