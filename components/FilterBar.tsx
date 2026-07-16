"use client";

import { useState } from "react";
import { Settings2, X } from "lucide-react";
import { PARTS, GENRES, WORK_TYPES } from "@/lib/constants";
import { Profile } from "@/types/profile";
import MultiSelect from "@/components/ui/MultiSelect";
import TagSelect from "@/components/TagSelect";
import Modal from "@/components/ui/Modal";
import ModalButton from "@/components/ui/ModalButton";

export interface FeedFilters {
  parts: string[];
  genres: string[];
  workTypes: string[];
  csp: boolean;
  career: boolean;
  authorTraits: string[];
}

export const EMPTY_FEED_FILTERS: FeedFilters = {
  parts: [],
  genres: [],
  workTypes: [],
  csp: false,
  career: false,
  authorTraits: [],
};

// AL-1: 같은 카테고리 내 다중 값 = OR, 다른 카테고리 간 = AND. 활성 필터가 하나도 없으면 전체 노출.
export function matchesAllActiveFilters(profile: Profile, filters: FeedFilters): boolean {
  if (filters.parts.length > 0 && !filters.parts.some((v) => profile.parts.includes(v))) return false;
  if (filters.genres.length > 0 && !filters.genres.some((v) => profile.preferredGenres.includes(v))) return false;
  if (filters.workTypes.length > 0 && !filters.workTypes.some((v) => profile.workTypes.includes(v))) return false;
  if (filters.csp && !profile.tools.includes("Clip Studio Paint")) return false;
  if (filters.career && profile.careers.length === 0) return false;
  if (filters.authorTraits.length > 0 && !filters.authorTraits.some((v) => profile.authorTraits.includes(v))) return false;
  return true;
}

interface FilterBarProps {
  filters: FeedFilters;
  onChange: (next: FeedFilters) => void;
}

function DropdownGroup({ filters, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <MultiSelect label="공정" options={PARTS} value={filters.parts} onChange={(parts) => onChange({ ...filters, parts })} />
      <MultiSelect label="장르" options={GENRES} value={filters.genres} onChange={(genres) => onChange({ ...filters, genres })} />
      <MultiSelect
        label="근무형태"
        options={WORK_TYPES}
        value={filters.workTypes}
        onChange={(workTypes) => onChange({ ...filters, workTypes })}
      />
    </div>
  );
}


function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[15px] font-bold text-neutral-900 mb-3">{title}</p>
      {children}
    </div>
  );
}

interface FilterBarWithCountProps extends FilterBarProps {
  resultCount: number;
}

export default function FilterBar({ filters, onChange, resultCount }: FilterBarWithCountProps) {
  const [allFiltersOpen, setAllFiltersOpen] = useState(false);

  // UT: 바에 깔려 있던 퀵칩 스트립은 2명이 불편/불필요하다고 지적했다
  // ("살짝 되게 힘들어… 차라리 쭉 고르는 게 편하다" — 멍군 / "불필요하게 느껴진다" — 이려원).
  // 칩 스트립과 가로 스크롤 버튼을 걷어내고, 같은 필터는 전체 필터 모달에서 섹션으로 고르게 남긴다.
  return (
    <div className="flex items-center gap-2 min-w-0">
      <button
        type="button"
        onClick={() => setAllFiltersOpen(true)}
        aria-label="필터 전체"
        className="shrink-0 w-9 h-9 rounded-md border border-neutral-200 flex items-center justify-center text-neutral-600 transition-colors hover:border-neutral-400"
      >
        <Settings2 size={16} />
      </button>

      <div className="hidden md:flex items-center gap-2 shrink-0">
        <DropdownGroup filters={filters} onChange={onChange} />
      </div>

      {allFiltersOpen && (
        <Modal onClose={() => setAllFiltersOpen(false)} maxWidthClassName="max-w-[560px]" panel>
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 shrink-0">
            <h2 className="text-title font-semibold text-neutral-900">필터</h2>
            <button type="button" onClick={() => setAllFiltersOpen(false)} aria-label="닫기" className="text-neutral-400 hover:text-neutral-600">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">
            <FilterSection title="공정">
              <TagSelect options={PARTS} selected={filters.parts} onChange={(parts) => onChange({ ...filters, parts })} />
            </FilterSection>
            <FilterSection title="장르">
              <TagSelect options={GENRES} selected={filters.genres} onChange={(genres) => onChange({ ...filters, genres })} />
            </FilterSection>
            <FilterSection title="근무형태">
              <TagSelect
                options={WORK_TYPES}
                selected={filters.workTypes}
                onChange={(workTypes) => onChange({ ...filters, workTypes })}
              />
            </FilterSection>
          </div>

          <div className="flex items-center gap-3 px-5 py-4 border-t border-neutral-200 shrink-0">
            <ModalButton variant="secondary" onClick={() => onChange(EMPTY_FEED_FILTERS)}>
              초기화
            </ModalButton>
            <ModalButton variant="primary" onClick={() => setAllFiltersOpen(false)}>
              {resultCount}명의 작가 보기
            </ModalButton>
          </div>
        </Modal>
      )}
    </div>
  );
}
