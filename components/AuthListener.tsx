"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import { useProfileStore } from "@/store/useProfileStore";

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

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      const prevUser = useAuthStore.getState().user;
      setUser(user);
      setLoading(false);
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
