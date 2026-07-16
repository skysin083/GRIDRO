"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";

// Q&A는 배포에서 제외했다. 구인란은 다음 볼륨에서 열 예정이라 자리는 두되 준비 중임을 hover로 알린다.
const NAV_TABS = [
  { label: "구인란", href: null, comingSoon: true },
  { label: "구직란", href: "/feed", match: ["/feed", "/write", "/profile"] },
  // UT: "'내 이력서'로 보이면 내 건 줄 알겠는데 '이력서'라고 되어 있으니 눈에 안 띈다"(멍군).
  // 이 탭을 내 것으로 인식하지 못한 게 공개·비공개 전환을 못 찾은 선행 원인이었다.
  { label: "내 이력서", href: "/my", match: ["/my"] },
] as const;

export default function Header() {
  const pathname = usePathname();

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
                return (
                  <span
                    key={tab.label}
                    aria-disabled
                    className="group relative shrink-0 text-body-sm text-neutral-400 cursor-not-allowed select-none"
                  >
                    {tab.label}
                    {/* 준비 중 탭은 왜 안 눌리는지 hover로 알린다 — 클릭했는데 아무 반응 없는 것보다 낫다. */}
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1.5 text-caption font-medium text-white opacity-0 shadow-md transition-opacity duration-[.15s] group-hover:opacity-100"
                    >
                      아직 준비 중인 기능이에요
                    </span>
                  </span>
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

        {/* 검색은 삭제(구직란 필터로 충분). 마이페이지(계정)는 로그인이 붙어야 의미가 있어 그때 활성화한다. */}
        <div className="flex items-center gap-1 shrink-0">
          <span
            aria-disabled
            aria-label="마이페이지(준비 중)"
            className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-300 cursor-not-allowed transition-colors hover:bg-neutral-100"
          >
            <User size={18} />
          </span>
        </div>
      </div>
    </header>
  );
}
