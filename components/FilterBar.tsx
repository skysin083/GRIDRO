import { PARTS, GENRES, WORK_TYPES } from "@/lib/constants";
import Select from "@/components/ui/Select";

export interface FeedFilters {
  part: string;
  genre: string;
  workType: string;
  tool: boolean;
  communication: boolean;
  revision: boolean;
}

export const EMPTY_FEED_FILTERS: FeedFilters = {
  part: "",
  genre: "",
  workType: "",
  tool: false,
  communication: false,
  revision: false,
};

interface FilterBarProps {
  filters: FeedFilters;
  onChange: (next: FeedFilters) => void;
}

function QuickChip({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled
        className="text-body-sm px-3 py-1.5 rounded-pill border border-neutral-200 bg-white text-neutral-300 cursor-not-allowed select-none"
      >
        {label}
      </span>
    );
  }
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

export default function FilterBar({ filters, onChange }: FilterBarProps) {
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

      <span className="w-px h-5 bg-neutral-200 mx-1" />

      <QuickChip label="급구" active={false} disabled onClick={() => {}} />
      <QuickChip
        label="Clip Studio Paint"
        active={filters.tool}
        onClick={() => onChange({ ...filters, tool: !filters.tool })}
      />
      <QuickChip
        label="작업 소통 빠름"
        active={filters.communication}
        onClick={() => onChange({ ...filters, communication: !filters.communication })}
      />
      <QuickChip
        label="수정 대응 빠름"
        active={filters.revision}
        onClick={() => onChange({ ...filters, revision: !filters.revision })}
      />
    </div>
  );
}
