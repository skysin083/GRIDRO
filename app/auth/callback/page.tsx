"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/Toast";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const next = searchParams.get("next") ?? "/my";

  useEffect(() => {
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

  return null;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackInner />
    </Suspense>
  );
}
