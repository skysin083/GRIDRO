"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import { useProfileStore } from "@/store/useProfileStore";
import { identify, track } from "@/lib/mixpanel";

export default function AuthListener() {
  useEffect(() => {
    const { setUser, setLoading } = useAuthStore.getState().actions;
    const { hydrateFromRemote, clearRemote } = useProfileStore.getState().actions;

    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user ?? null;
      setUser(user);
      setLoading(false);
      if (user) hydrateFromRemote(user.id);
    });

    // login_completed는 여기서만 쏜다 — app/auth/callback/page.tsx의 수동
    // exchangeCodeForSession()은 SDK의 자동 세션 감지(detectSessionInUrl 기본값)와 경합해
    // 종종 "invalid flow state"로 실패한다(lib/supabaseClient.ts 주석 참고). 그 성공 분기에만
    // 이벤트를 심어두면 실제로는 로그인에 성공한 유저 대부분이 잡히지 않는다. onAuthStateChange의
    // SIGNED_IN은 세션이 자동/수동 어느 경로로 만들어졌든 항상 한 번 오므로 여기가 유일한 진실.
    //
    // AT-3(버그수정): "INITIAL_SESSION에서는 안 쏘니 중복 집계 안 된다"는 가정이 실제로는 틀렸다 —
    // 이 SDK(@supabase/auth-js 2.110.7)는 클라이언트 초기화 시 저장된 세션을 복구하는
    // _recoverAndRefresh()가, 만료가 임박하지 않은 유효한 세션을 찾으면 INITIAL_SESSION이 아니라
    // SIGNED_IN을 전체 구독자에게 브로드캐스트한다(auth-js GoTrueClient.js _recoverAndRefresh 참고).
    // 즉 이미 로그인된 유저가 새로고침하거나 재방문할 때마다 login_started 없이 SIGNED_IN이 와서
    // login_completed가 중복 집계됐다 — 이게 started(2) < completed(6) 불일치의 원인이다.
    // 진짜 새 로그인과 이 스퓨리어스 재통지를 구분하는 유일한 신호는 "유저가 실제로 바뀌었는가"이므로,
    // 아래 hydrateFromRemote 트리거와 동일한 조건(user.id !== prevUser?.id)으로 게이팅한다.
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null;
      const prevUser = useAuthStore.getState().user;
      const isActualUserChange = user != null && user.id !== prevUser?.id;
      setUser(user);
      setLoading(false);
      if (event === "SIGNED_IN" && user && isActualUserChange) {
        identify(user.id);
        const isNewUser =
          !user.last_sign_in_at ||
          Math.abs(new Date(user.created_at).getTime() - new Date(user.last_sign_in_at).getTime()) < 5000;
        track("login_completed", { is_new_user: isNewUser });
      }
      // TOKEN_REFRESHED 등 같은 유저로의 재통지에서는 다시 불러올 필요가 없다 — 유저가 바뀔 때만.
      if (isActualUserChange) {
        hydrateFromRemote(user.id);
      } else if (!user) {
        clearRemote();
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  return null;
}
