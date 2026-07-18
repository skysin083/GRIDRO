"use client";

import { useState } from "react";
import { Settings2, X } from "lucide-react";
import { PARTS, GENRES, WORK_TYPES } from "@/lib/constants";
import { Profile } from "@/types/profile";
import MultiSelect from "@/components/ui/MultiSelect";
import TagSelect from "@/components/TagSelect";
import Modal from "@/components/ui/Modal";
import ModalButton from "@/components/ui/ModalButton";
import { track } from "@/lib/mixpanel";

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

// MultiSelect/TagSelect는 onChange로 항상 배열 전체를 넘기지만, 한 번 클릭에 값 하나만 토글되므로
// 이전/이후 배열을 비교하면 방금 어떤 값이 켜졌는지/꺼졌는지 알 수 있다.
function diffToggledValue(prev: string[], next: string[]): string | null {
  if (next.length > prev.length) return next.find((v) => !prev.includes(v)) ?? null;
  if (next.length < prev.length) return prev.find((v) => !next.includes(v)) ?? null;
  return null;
}

// filter_applied: 실제 UI에 있는 필터(공정/장르/근무형태)만 계측한다. FeedFilters의 csp/career/
// authorTraits는 matchesAllActiveFilters에는 남아있지만 이걸 켜는 UI가 현재 어디에도 없다(과거
// 퀵칩 스트립이 UT 피드백으로 제거된 뒤 재구현되지 않음) — 존재하지 않는 조작을 계측할 수 없다.
// type은 "dropdown" 하나만 쓴다: 데스크톱 상단 바(MultiSelect)든 "필터 전체" 모달(TagSelect)이든
// 목록에서 값을 고르는 동일한 패턴이고, 문서가 말하는 "quick"(퀵칩) UI 자체가 없다.
function trackFilterChange(prev: FeedFilters, next: FeedFilters) {
  const partsChanged = diffToggledValue(prev.parts, next.parts);
  if (partsChanged) track("filter_applied", { type: "dropdown", field: "parts", value: partsChanged });
  const genresChanged = diffToggledValue(prev.genres, next.genres);
  if (genresChanged) track("filter_applied", { type: "dropdown", field: "genres", value: genresChanged });
  const workTypesChanged = diffToggledValue(prev.workTypes, next.workTypes);
  if (workTypesChanged) track("filter_applied", { type: "dropdown", field: "workTypes", value: workTypesChanged });
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

  const handleChange = (next: FeedFilters) => {
    trackFilterChange(filters, next);
    onChange(next);
  };

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
        <DropdownGroup filters={filters} onChange={handleChange} />
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
              <TagSelect options={PARTS} selected={filters.parts} onChange={(parts) => handleChange({ ...filters, parts })} />
            </FilterSection>
            <FilterSection title="장르">
              <TagSelect options={GENRES} selected={filters.genres} onChange={(genres) => handleChange({ ...filters, genres })} />
            </FilterSection>
            <FilterSection title="근무형태">
              <TagSelect
                options={WORK_TYPES}
                selected={filters.workTypes}
                onChange={(workTypes) => handleChange({ ...filters, workTypes })}
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
