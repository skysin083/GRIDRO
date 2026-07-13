"use client";

import { useRef, useState } from "react";
import { Settings2, ChevronRight, X } from "lucide-react";
import { PARTS, GENRES, WORK_TYPES } from "@/lib/constants";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ModalButton from "@/components/ui/ModalButton";

export interface FeedFilters {
  part: string;
  genre: string;
  workType: string;
  csp: boolean;
  career: boolean;
}

export const EMPTY_FEED_FILTERS: FeedFilters = {
  part: "",
  genre: "",
  workType: "",
  csp: false,
  career: false,
};

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

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-body-sm px-3 py-1.5 rounded-pill border transition-colors duration-[.18s] ${
        active
          ? "bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-700"
          : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400"
      }`}
    >
      {label}
    </button>
  );
}

function FilterChipGroup({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <FilterChip key={option} label={option} active={value === option} onClick={() => onChange(value === option ? "" : option)} />
      ))}
    </div>
  );
}

function DropdownGroup({ filters, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select label="공정" options={PARTS} value={filters.part} onChange={(part) => onChange({ ...filters, part })} />
      <Select label="장르" options={GENRES} value={filters.genre} onChange={(genre) => onChange({ ...filters, genre })} />
      <Select
        label="근무형태"
        options={WORK_TYPES}
        value={filters.workType}
        onChange={(workType) => onChange({ ...filters, workType })}
      />
    </div>
  );
}

// AK-1: 공정 3종 퀵칩은 공정 드롭다운 필터(filters.part)의 단축키 — 같은 상태를 공유하므로 자동 동기화된다.
function QuickChips({ filters, onChange }: FilterBarProps) {
  return (
    <>
      {(["선화", "채색", "배경"] as const).map((part) => (
        <QuickChip
          key={part}
          label={part}
          active={filters.part === part}
          onClick={() => onChange({ ...filters, part: filters.part === part ? "" : part })}
        />
      ))}
      <QuickChip label="연재 경력 있음" active={filters.career} onClick={() => onChange({ ...filters, career: !filters.career })} />
      <QuickChip label="Clip Studio Paint" active={filters.csp} onClick={() => onChange({ ...filters, csp: !filters.csp })} />
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
              <FilterChipGroup options={PARTS} value={filters.part} onChange={(part) => onChange({ ...filters, part })} />
            </FilterSection>
            <FilterSection title="장르">
              <FilterChipGroup options={GENRES} value={filters.genre} onChange={(genre) => onChange({ ...filters, genre })} />
            </FilterSection>
            <FilterSection title="근무형태">
              <FilterChipGroup options={WORK_TYPES} value={filters.workType} onChange={(workType) => onChange({ ...filters, workType })} />
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
