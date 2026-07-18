"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageview } from "@/lib/mixpanel";

// 검증 계획(H1~H4) 기준 5개 카테고리로 매핑 — 나머지 라우트(로그인 등)는 실제 상태를 정확히
// 반영하는 값으로 남겨둔다(없는 카테고리에 억지로 끼워 맞추지 않는다).
function pageCategory(pathname: string): string {
  if (pathname === "/") return "landing";
  if (pathname === "/feed") return "feed";
  if (pathname.startsWith("/profile/")) return "detail";
  if (pathname === "/write") return "form";
  if (pathname === "/my") return "my";
  if (pathname === "/login") return "login";
  if (pathname === "/account") return "account";
  if (pathname === "/auth/callback") return "auth_callback";
  return pathname;
}

export default function AnalyticsListener() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageview(pageCategory(pathname));
  }, [pathname]);

  return null;
}
