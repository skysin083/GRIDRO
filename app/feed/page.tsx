"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useProfileStore } from "@/store/useProfileStore";
import { fetchPublishedProfiles } from "@/lib/resumesApi";
import { Profile } from "@/types/profile";
import ProfileCard from "@/components/ProfileCard";
import FilterBar, { EMPTY_FEED_FILTERS, FeedFilters, matchesAllActiveFilters } from "@/components/FilterBar";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

const PAGE_SIZE = 20;

// 전체 페이지가 많을 때 1 … 4 5 6 … 12 처럼 현재 페이지 주변 + 처음/끝만 남기고 나머지는 줄인다.
function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...keep].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("…");
    result.push(p);
    prev = p;
  }
  return result;
}

// 카드 그리드와 같은 자리에서 로딩 중임을 알린다 — 안 그러면 서버 조회가 끝나기 전
// "아직 등록된 이력서가 없어요"가 먼저 뜨어 오류가 난 줄 알기 쉽다(현직자 피드백).
function FeedSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse space-y-2">
          <div className="w-full aspect-[3/4] rounded-lg bg-neutral-100" />
          <div className="h-4 w-4/5 rounded bg-neutral-100" />
          <div className="h-3 w-2/5 rounded bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

export default function FeedPage() {
  const resumes = useProfileStore((s) => s.resumes);

  const [filters, setFilters] = useState<FeedFilters>(EMPTY_FEED_FILTERS);
  // 전체 유저 대상 공개 이력서 — 로그인 여부와 무관하게 누구나 구직란을 볼 수 있어야 한다.
  const [publishedProfiles, setPublishedProfiles] = useState<Profile[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [page, setPage] = useState(1);
  // 필터 서명이 바뀐 걸 렌더 중에 감지해 페이지를 1로 되돌린다 — 안 그러면 필터링 후
  // 목록이 짧아졌을 때 존재하지 않는 페이지에 멈춰 빈 화면을 보여줄 수 있다.
  const [lastFiltersKey, setLastFiltersKey] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPublishedProfiles()
      .then(setPublishedProfiles)
      .catch((e) => console.error("공개 이력서 조회 실패", e))
      .finally(() => setFeedLoading(false));
  }, []);

  // publishedAt 최신순(내림차순). 끌올하면 publishedAt이 갱신되어 자동으로 맨 위로 올라온다.
  const feed = useMemo(
    () => [...publishedProfiles].sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0)),
    [publishedProfiles]
  );

  const filtered = feed.filter((p) => matchesAllActiveFilters(p, filters));

  const hasActiveFilter = Object.values(filters).some((v) => (Array.isArray(v) ? v.length > 0 : v !== false));

  const filtersKey = JSON.stringify(filters);
  if (filtersKey !== lastFiltersKey) {
    setLastFiltersKey(filtersKey);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goToPage = (next: number) => {
    setPage(next);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-14 space-y-8">
      <PageHeader
        title="어떤 작가를 찾고 있나요?"
        action={
          // 모바일에서는 카드를 내려보는 동안 이 버튼이 화면 밖으로 밀려나 다시 맨 위로
          // 스크롤해야 했다 — 아래 고정 버튼으로 대체하고, 여기는 데스크톱에서만 보여준다.
          <div className="hidden md:block">
            <Button href={resumes.length > 0 ? "/my" : "/write?entry=cta_feed"} variant="dark-pill" arrow>
              구직하기
            </Button>
          </div>
        }
      />

      <Link
        href={resumes.length > 0 ? "/my" : "/write?entry=cta_feed"}
        className="md:hidden fixed bottom-5 right-5 z-30 flex items-center gap-1.5 bg-neutral-900 text-white text-body-sm font-medium rounded-pill pl-4 pr-3.5 py-3 shadow-lg"
      >
        구직하기
        <ArrowRight size={16} />
      </Link>

      {/* 헤더가 모바일에선 탭 메뉴가 별도 줄로 내려가 91px, 데스크톱은 한 줄이라 64px — 그
          아래에 딱 붙게 오프셋을 맞춘다. */}
      <div className="sticky top-[91px] md:top-16 z-20 bg-white/[.95] backdrop-blur-sm border-b border-neutral-200 py-4">
        <div className="flex items-center justify-between gap-4">
          <FilterBar filters={filters} onChange={setFilters} resultCount={filtered.length} />
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-body-sm font-semibold text-neutral-400">작가 {filtered.length}명</span>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FEED_FILTERS)}
                className="text-body-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-900"
              >
                필터 초기화
              </button>
            )}
          </div>
        </div>
      </div>

      {feedLoading ? (
        <FeedSkeleton />
      ) : filtered.length > 0 ? (
        <div ref={resultsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 scroll-mt-24">
          {paginated.map((profile, index) => (
            <ProfileCard key={profile.id} profile={profile} position={(currentPage - 1) * PAGE_SIZE + index} />
          ))}
        </div>
      ) : (
        <div>
          <EmptyState message={hasActiveFilter ? "조건에 맞는 작가가 없어요" : "아직 등록된 이력서가 없어요"} />
          {hasActiveFilter && (
            <div className="text-center -mt-16">
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FEED_FILTERS)}
                className="text-body-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-900"
              >
                필터 초기화
              </button>
            </div>
          )}
        </div>
      )}

      {!feedLoading && totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1.5 pt-4" aria-label="페이지네이션">
          <button
            type="button"
            onClick={() => goToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            aria-label="이전 페이지"
            className="w-9 h-9 rounded-md flex items-center justify-center text-neutral-500 transition-colors hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          {getPageNumbers(currentPage, totalPages).map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-neutral-300">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => goToPage(p)}
                aria-current={p === currentPage ? "page" : undefined}
                className={`w-9 h-9 rounded-md text-body-sm font-medium flex items-center justify-center transition-colors ${
                  p === currentPage ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {p}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            aria-label="다음 페이지"
            className="w-9 h-9 rounded-md flex items-center justify-center text-neutral-500 transition-colors hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </div>
  );
}
