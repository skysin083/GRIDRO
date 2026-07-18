"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { PART_CATEGORIES } from "@/lib/constants";

interface CategoryPartSelectProps {
  selected: string[];
  onChange: (next: string[]) => void;
  rankBadges?: number;
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <span className="absolute -top-2 -right-1.5 px-1.5 h-[18px] rounded-pill bg-primary-500 text-white text-[10px] font-bold leading-[18px] whitespace-nowrap">
      {rank + 1}순위
    </span>
  );
}

/** 작업 파트를 카테고리(각색·작화·채색…) 별로 그룹핑하여 보여주는 선택 컴포넌트.
 *  직접 추가(커스텀 칩)도 지원한다. */
export default function CategoryPartSelect({ selected, onChange, rankBadges = 0 }: CategoryPartSelectProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const allKnownParts = PART_CATEGORIES.flatMap((c) => [...c.parts]);

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

  const customChips = selected.filter((s) => !allKnownParts.includes(s));

  return (
    <div className="space-y-4">
      {PART_CATEGORIES.map((cat) => (
        <div key={cat.category}>
          <p className="text-caption font-bold text-neutral-500 mb-2">{cat.category}</p>
          <div className="flex flex-wrap gap-2">
            {cat.parts.map((option) => {
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
          </div>
        </div>
      ))}

      {/* 직접 추가한 커스텀 칩 + 추가 버튼 */}
      <div className="flex flex-wrap gap-2 items-center">
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
            placeholder="파트 입력 후 Enter"
            className="text-body-sm px-3 py-1.5 rounded-pill border border-primary-300 outline-none w-32"
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-body-sm px-3 py-1.5 rounded-pill border border-dashed border-neutral-300 text-neutral-500 transition-colors hover:border-primary-300 hover:text-primary-600 flex items-center gap-1"
          >
            <Plus size={13} />
            직접 추가
          </button>
        )}
      </div>
    </div>
  );
}
