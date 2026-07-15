"use client";

import { useRef, useState } from "react";
import { Settings2, ChevronRight, X } from "lucide-react";
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

function QuickChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 text-body-sm px-3 py-1.5 rounded-pill border transition-colors duration-[.18s] ${
        active
          ? "bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-700"
          : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400"
      }`}
    >
      {label}
    </button>
  );
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

// AL-3: 확정 퀵칩 8종. 각 칩은 대응 드롭다운 필터의 단축키 — 별도 상태 없이 같은 filters 객체를 그대로
// 읽고 쓰기 때문에 드롭다운 ↔ 퀵칩 양방향 동기화가 자동으로 이루어진다.
type QuickChipDef =
  | { label: string; kind: "boolean"; field: "career" | "csp" }
  | { label: string; kind: "array"; field: "parts" | "genres" | "authorTraits"; value: string };

const QUICK_CHIPS: readonly QuickChipDef[] = [
  { label: "연재 경력 있음", kind: "boolean", field: "career" },
  { label: "Clip Studio Paint", kind: "boolean", field: "csp" },
  { label: "밑색", kind: "array", field: "parts", value: "밑색" },
  { label: "명암", kind: "array", field: "parts", value: "명암" },
  { label: "로맨스", kind: "array", field: "genres", value: "로맨스" },
  { label: "액션", kind: "array", field: "genres", value: "액션" },
  { label: "연락 잘됨", kind: "array", field: "authorTraits", value: "연락 잘됨" },
  { label: "피드백 수용 잘함", kind: "array", field: "authorTraits", value: "피드백 수용 잘함" },
];

function QuickChips({ filters, onChange }: FilterBarProps) {
  return (
    <>
      {QUICK_CHIPS.map((chip) => {
        if (chip.kind === "boolean") {
          const active = filters[chip.field];
          return (
            <QuickChip
              key={chip.label}
              label={chip.label}
              active={active}
              onClick={() => onChange({ ...filters, [chip.field]: !active })}
            />
          );
        }
        const list = filters[chip.field];
        const active = list.includes(chip.value);
        return (
          <QuickChip
            key={chip.label}
            label={chip.label}
            active={active}
            onClick={() =>
              onChange({
                ...filters,
                [chip.field]: active ? list.filter((v) => v !== chip.value) : [...list, chip.value],
              })
            }
          />
        );
      })}
    </>
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
  const scrollRef = useRef<HTMLDivElement>(null);

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
        <span className="w-px h-5 bg-neutral-200 mx-1" />
      </div>

      <div ref={scrollRef} className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <QuickChips filters={filters} onChange={onChange} />
      </div>

      <button
        type="button"
        onClick={() => scrollRef.current?.scrollBy({ left: 160, behavior: "smooth" })}
        aria-label="필터 더 보기"
        className="shrink-0 w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 transition-colors hover:border-neutral-400 hover:text-neutral-700"
      >
        <ChevronRight size={16} />
      </button>

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
            <FilterSection title="빠른 필터">
              <div className="flex flex-wrap gap-2">
                <QuickChips filters={filters} onChange={onChange} />
              </div>
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
