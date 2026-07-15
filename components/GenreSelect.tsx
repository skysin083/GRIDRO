"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

interface GenreSelectProps {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  /** Show a numbered ①② badge on the first N selections, in selection order. 0 = no ranking. */
  rankBadges?: number;
  /** M-2 에러 문법: 최소 1개 선택 검증 실패 시 표시 */
  error?: boolean;
}

// UT: 숫자만 담은 원형 배지가 알림/오류로 읽혔다("오류인 거야?" — 주일).
// 6명 중 4명이 순위라는 걸 인지하지 못해, 숫자 대신 '1순위' 텍스트를 그대로 노출한다.
function RankBadge({ rank }: { rank: number }) {
  return (
    <span className="absolute -top-2 -right-1.5 px-1.5 h-[18px] rounded-pill bg-primary-500 text-white text-[10px] font-bold leading-[18px] whitespace-nowrap">
      {rank + 1}순위
    </span>
  );
}

export default function GenreSelect({ options, selected, onChange, rankBadges = 0, error = false }: GenreSelectProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const toggle = (option: string) => {
    if (selected.includes(option)) onChange(selected.filter((o) => o !== option));
    else onChange([...selected, option]);
  };

  const removeCustom = (option: string) => onChange(selected.filter((o) => o !== option));

  const commitDraft = () => {
    const value = draft.trim();
    if (value && !selected.includes(value)) onChange([...selected, value]);
    setDraft("");
    setAdding(false);
  };

  const customChips = selected.filter((s) => !options.includes(s));

  return (
    <div>
      <div
        className={`flex flex-wrap gap-2 items-center rounded-md transition-shadow duration-[.18s] ${
          error ? "ring-2 ring-danger ring-offset-2" : ""
        }`}
      >
        {options.map((option) => {
        const active = selected.includes(option);
        const rank = active ? selected.indexOf(option) : -1;
        const showRank = rankBadges > 0 && rank >= 0 && rank < rankBadges;
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`relative text-body-sm px-3 py-1.5 rounded-pill border transition-colors duration-[.18s] ${
              active
                ? "bg-primary-50 text-primary-700 border-primary-500"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
            }`}
          >
            {option}
            {showRank && <RankBadge rank={rank} />}
          </button>
        );
      })}

      {customChips.map((option) => {
        const rank = selected.indexOf(option);
        const showRank = rankBadges > 0 && rank >= 0 && rank < rankBadges;
        return (
          <span
            key={option}
            className="relative inline-flex items-center gap-1.5 text-body-sm pl-3 pr-2 py-1.5 rounded-pill border border-primary-500 bg-primary-50 text-primary-700"
          >
            {option}
            <button
              type="button"
              onClick={() => removeCustom(option)}
              aria-label={`${option} 삭제`}
              className="text-primary-400 hover:text-primary-700"
            >
              <X size={12} />
            </button>
            {showRank && <RankBadge rank={rank} />}
          </span>
        );
      })}

      {adding ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitDraft();
            if (e.key === "Escape") {
              setDraft("");
              setAdding(false);
            }
          }}
          onBlur={commitDraft}
          placeholder="장르 입력 후 Enter"
          className="text-body-sm px-3 py-1.5 rounded-pill border border-primary-300 outline-none w-32"
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-body-sm px-3 py-1.5 rounded-pill border border-dashed border-neutral-300 text-neutral-500 transition-colors hover:border-primary-300 hover:text-primary-600 flex items-center gap-1"
        >
          <Plus size={13} />
          추가
        </button>
      )}
      </div>
      {error && <p className="text-caption text-danger mt-1.5">최소 1개는 선택해주세요</p>}
    </div>
  );
}
