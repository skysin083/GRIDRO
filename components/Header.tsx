"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, User } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/useAuthStore";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const FEEDBACK_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdSwJGKrL3EPtypo_AZP2QOpiycC9Lx_G6bFC74jFiDWcfIBg/viewform?usp=header";

// Q&A는 배포에서 제외했다. 구인란은 다음 볼륨에서 열 예정이라 자리는 두되 클릭 시 준비 중임을 알린다.
const NAV_TABS = [
  { label: "구인란", href: null },
  { label: "구직란", href: "/feed", match: ["/feed", "/profile"] },
  // UT: "'내 이력서'로 보이면 내 건 줄 알겠는데 '이력서'라고 되어 있으니 눈에 안 띈다"(멍군).
  // 이 탭을 내 것으로 인식하지 못한 게 공개·비공개 전환을 못 찾은 선행 원인이었다.
  // /write는 항상 내 이력서를 쓰는 화면이라(진입 경로와 무관하게) 여기서 매치한다.
  { label: "내 이력서", href: "/my", match: ["/my", "/write"] },
] as const;

export default function Header() {
  const pathname = usePathname();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);

  // /login은 자체 전체화면 레이아웃(좌 브랜드/우 로그인)이라 상단 탭바를 겹쳐 보여주지 않는다.
  if (pathname === "/login") return null;

  // AO-1(재정정): 로고 옆에 붙여 넣으면 좁은 화면에서 남는 공간이 0에 가까워져 탭이
  // 전부 잘리거나 사라졌다(회원가입 버튼 하나만 남겨도 여전히 부족). 모바일에서는 탭을
  // 아예 별도 줄로 내려 전체 폭을 쓰게 하고, 데스크톱은 기존대로 로고 옆 한 줄을 유지한다.
  const renderTabs = (className: string) => (
    <nav className={className}>
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
  );

  return (
    <header className="print:hidden sticky top-0 z-30 border-b border-neutral-200 bg-white">
      <div className="max-w-[1160px] mx-auto px-5 md:px-10">
        <div className="h-14 md:h-16 flex items-center justify-between gap-4 md:gap-8">
          <div className="flex items-center gap-12 min-w-0">
            <div className="shrink-0 flex items-center gap-1.5">
              <Link href="/" className="flex items-center">
                {/* 로고 파일 교체 후에도 예전 캐시된 이미지가 계속 보이는 걸 막기 위해 버전 쿼리를 붙인다.
                    교체할 때마다 이 값을 올릴 것. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.svg?v=3" alt="GRIDRO" className="h-5 w-auto" />
              </Link>
              {/* AS-6: 미구현 기능이 많은 초기 배포임을 명시 — "만들어가는 중"으로 읽히게 */}
              <Badge variant="primary">BETA</Badge>
            </div>
            {renderTabs("hidden md:flex items-center gap-9")}
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
            {/* 로그인 여부가 확정되기 전(getSession 조회 중)엔 아무것도 보여주지 않는다 —
                버튼 두 개 -> 아이콘으로 깜빡이는 걸 막는다. */}
            {authLoading ? null : user ? (
              <Link
                href="/account"
                aria-label="마이페이지"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-neutral-100 ${
                  pathname.startsWith("/account") ? "text-neutral-900" : "text-neutral-400"
                }`}
              >
                <User size={18} />
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                {/* 탭 메뉴를 별도 줄로 뺀 덕분에 이 줄엔 다시 여유가 생겨 모바일에서도 두 버튼
                    다 보여줄 수 있다(전엔 탭과 한 줄에서 경합해 하나를 숨겨야 했다). */}
                <Button href="/login" variant="ghost" size="sm">
                  로그인
                </Button>
                {/* 회원가입도 /login으로 보낸다 — 구글 OAuth 하나로 로그인·가입이 통합돼 있어 별도 폼이 없다. */}
                <Button href="/login" variant="dark-pill" size="sm">
                  회원가입
                </Button>
              </div>
            )}
          </div>
        </div>

        {renderTabs("md:hidden flex items-center gap-6 pb-3")}
      </div>
    </header>
  );
}
