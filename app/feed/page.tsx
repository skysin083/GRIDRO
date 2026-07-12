"use client";

import { useMemo, useState } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import ProfileCard from "@/components/ProfileCard";
import FilterBar, { EMPTY_FEED_FILTERS, FeedFilters } from "@/components/FilterBar";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";

export default function FeedPage() {
  const resumes = useProfileStore((s) => s.resumes);
  const dummyProfiles = useProfileStore((s) => s.dummyProfiles);

  const [filters, setFilters] = useState<FeedFilters>(EMPTY_FEED_FILTERS);

  const published = resumes.find((r) => r.isPublished);

  const feed = useMemo(
    () => [...(published ? [published.profile] : []), ...dummyProfiles],
    [published, dummyProfiles]
  );

  const filtered = feed.filter((p) => {
    if (filters.part && !p.parts.includes(filters.part)) return false;
    if (filters.genre && !p.preferredGenres.includes(filters.genre)) return false;
    if (filters.workType && p.workType !== filters.workType) return false;
    if (filters.tool && !p.tools.some((t) => t.name === "Clip Studio Paint")) return false;
    if (filters.communication && !p.authorTraits.includes("소통 원활")) return false;
    if (filters.revision && !p.authorTraits.includes("수정 대응 빠름")) return false;
    return true;
  });

  const hasActiveFilter = Object.values(filters).some((v) => v !== "" && v !== false);

  return (
    <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-14 space-y-8">
      <PageHeader
        eyebrow="구직란"
        title="어떤 작가를 찾고 있나요?"
        lead="공정과 장르로 좁혀서 원하는 작가를 찾아보세요."
        action={
          <Button href={resumes.length > 0 ? "/my" : "/write"} variant="dark-pill" arrow>
            구직하기
          </Button>
        }
      />

      <div className="sticky top-16 z-20 bg-white/[.95] backdrop-blur-sm border-b border-neutral-200 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <FilterBar filters={filters} onChange={setFilters} />
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-body-sm font-semibold text-neutral-400">작가 {filtered.length}명</span>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FEED_FILTERS)}
                className="text-body-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-900"
              >
                초기화
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {filtered.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <p className="text-h3 font-bold text-neutral-900">조건에 맞는 작가가 없어요</p>
          <p className="text-body-sm text-neutral-400">필터를 하나씩 풀어보세요</p>
          <Button variant="dark-pill" onClick={() => setFilters(EMPTY_FEED_FILTERS)}>
            필터 초기화
          </Button>
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
