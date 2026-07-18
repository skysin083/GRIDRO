"use client";

import { useEffect, useMemo, useState } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import { fetchPublishedProfiles } from "@/lib/resumesApi";
import { Profile } from "@/types/profile";
import ProfileCard from "@/components/ProfileCard";
import FilterBar, { EMPTY_FEED_FILTERS, FeedFilters, matchesAllActiveFilters } from "@/components/FilterBar";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

export default function FeedPage() {
  const resumes = useProfileStore((s) => s.resumes);

  const [filters, setFilters] = useState<FeedFilters>(EMPTY_FEED_FILTERS);
  // 전체 유저 대상 공개 이력서 — 로그인 여부와 무관하게 누구나 구직란을 볼 수 있어야 한다.
  const [publishedProfiles, setPublishedProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    fetchPublishedProfiles()
      .then(setPublishedProfiles)
      .catch((e) => console.error("공개 이력서 조회 실패", e));
  }, []);

  // publishedAt 최신순(내림차순). 끌올하면 publishedAt이 갱신되어 자동으로 맨 위로 올라온다.
  const feed = useMemo(
    () => [...publishedProfiles].sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0)),
    [publishedProfiles]
  );

  const filtered = feed.filter((p) => matchesAllActiveFilters(p, filters));

  const hasActiveFilter = Object.values(filters).some((v) => (Array.isArray(v) ? v.length > 0 : v !== false));

  return (
    <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-14 space-y-8">
      <PageHeader
        title="어떤 작가를 찾고 있나요?"
        action={
          <Button href={resumes.length > 0 ? "/my" : "/write?entry=cta_feed"} variant="dark-pill" arrow>
            구직하기
          </Button>
        }
      />

      <div className="sticky top-16 z-20 bg-white/[.95] backdrop-blur-sm border-b border-neutral-200 py-4">
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

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filtered.map((profile, index) => (
            <ProfileCard key={profile.id} profile={profile} position={index} />
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

      {filtered.length > 0 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <span className="w-9 h-9 rounded-md bg-neutral-900 text-white text-body-sm flex items-center justify-center">
            1
          </span>
        </div>
      )}
    </div>
  );
}
