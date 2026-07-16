"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, User } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

// TODO: 실제 의견 수집 통로로 교체할 것 (구글 폼 URL 등). 지금은 임시로 빈 폼 링크.
const FEEDBACK_URL = "https://forms.gle/REPLACE_ME";

// Q&A는 배포에서 제외했다. 구인란은 다음 볼륨에서 열 예정이라 자리는 두되 클릭 시 준비 중임을 알린다.
const NAV_TABS = [
  { label: "구인란", href: null },
  { label: "구직란", href: "/feed", match: ["/feed", "/write", "/profile"] },
  // UT: "'내 이력서'로 보이면 내 건 줄 알겠는데 '이력서'라고 되어 있으니 눈에 안 띈다"(멍군).
  // 이 탭을 내 것으로 인식하지 못한 게 공개·비공개 전환을 못 찾은 선행 원인이었다.
  { label: "내 이력서", href: "/my", match: ["/my"] },
] as const;

export default function Header() {
  const pathname = usePathname();
  const toast = useToast();

  return (
    <header className="print:hidden sticky top-0 z-30 border-b border-neutral-200 bg-white">
      <div className="max-w-[1160px] mx-auto px-5 md:px-10 h-16 flex items-center justify-between gap-8">
        <div className="flex items-center gap-12 min-w-0">
          <Link href="/" className="text-h3 font-bold text-primary-500 shrink-0">
            GRIDRO
          </Link>

          {/* AO-1: 하단 고정 탭바(AM-1) 정정 — 모바일에서도 상단 메뉴를 노출한다.
              4개 항목이 한 줄에 안 들어가면 줄바꿈 대신 가로 스크롤(겹침·잘림 방지).
              overflow-x-auto는 콘텐츠가 이미 들어가는 데스크톱 폭에서는 아무 영향이 없어
              "데스크톱 현행 유지" 요건과 충돌하지 않는다. */}
          <nav className="flex items-center gap-9 overflow-x-auto scrollbar-hide min-w-0">
            {NAV_TABS.map((tab) => {
              if (!tab.href) {
                // 준비 중 탭은 hover 툴팁이 nav의 overflow에 잘리고 모바일엔 hover도 없어,
                // 클릭 시 토스트로 알린다 — 눌렀는데 아무 반응 없는 것보다 낫다.
                return (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => toast.show("아직 준비 중인 기능이에요")}
                    className="shrink-0 text-body-sm text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {tab.label}
                  </button>
                );
              }
              const isActive = tab.match.some((p) => pathname === p || pathname.startsWith(`${p}/`));
              return (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className={`shrink-0 text-body-sm transition-colors ${
                    isActive ? "font-bold text-neutral-900" : "font-normal text-neutral-400 hover:text-neutral-600"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 검색은 삭제(구직란 필터로 충분). */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* 초기 배포라 실제 사용자 의견을 모으는 통로를 눈에 띄게 둔다. */}
          <a
            href={FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-body-sm font-medium text-neutral-600 border border-neutral-200 rounded-pill pl-2.5 pr-3 py-1.5 transition-colors hover:border-neutral-400 hover:text-neutral-900"
          >
            <MessageSquarePlus size={16} />
            <span className="hidden sm:inline">의견 보내기</span>
          </a>
          {/* 로그인 전이라 "계정"은 아직 없지만, 지금 가진 것(내 이력서·북마크)은 보여줄 수 있어 페이지를 열어둔다. */}
          <Link
            href="/account"
            aria-label="마이페이지"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-neutral-100 ${
              pathname.startsWith("/account") ? "text-neutral-900" : "text-neutral-400"
            }`}
          >
            <User size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}
