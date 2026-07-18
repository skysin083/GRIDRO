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
    // INITIAL_SESSION(새로고침 시 기존 세션 복원)에서는 안 쏴야 재방문마다 중복 집계되지 않는다.
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null;
      const prevUser = useAuthStore.getState().user;
      setUser(user);
      setLoading(false);
      if (event === "SIGNED_IN" && user) {
        identify(user.id);
        const isNewUser =
          !user.last_sign_in_at ||
          Math.abs(new Date(user.created_at).getTime() - new Date(user.last_sign_in_at).getTime()) < 5000;
        track("login_completed", { is_new_user: isNewUser });
      }
      // TOKEN_REFRESHED 등 같은 유저로의 재통지에서는 다시 불러올 필요가 없다 — 유저가 바뀔 때만.
      if (user && user.id !== prevUser?.id) {
        hydrateFromRemote(user.id);
      } else if (!user) {
        clearRemote();
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  return null;
}
