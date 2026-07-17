import { create } from "zustand";
import type { User } from "@supabase/supabase-js";

interface AuthStore {
  user: User | null;
  /** 최초 getSession() 조회가 끝나기 전까지 true — 이 동안은 로그인 가드가 리다이렉트를 보류한다. */
  loading: boolean;
  actions: {
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
  };
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  actions: {
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
  },
}));
