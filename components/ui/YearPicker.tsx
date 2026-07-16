"use client";

import { useEffect, useRef, useState } from "react";

export interface YearMonth {
  year: number;
  month: number;
}

interface YearPickerProps {
  value: YearMonth | null;
  onChange: (value: YearMonth) => void;
  placeholder?: string;
  /** 이 날짜 이전은 선택 불가 (역행 방지용) */
  minDate?: YearMonth | null;
  /** 이 날짜 이후는 선택 불가 (역행 방지용) */
  maxDate?: YearMonth | null;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 12 }, (_, i) => CURRENT_YEAR - i).reverse();
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function toMonthIndex(ym: YearMonth) {
  return ym.year * 12 + ym.month;
}

export default function YearPicker({ value, onChange, placeholder = "YYYY.MM", minDate, maxDate }: YearPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const label = value ? `${value.year}.${String(value.month).padStart(2, "0")}` : placeholder;

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`text-body-sm px-3 py-2 rounded-md border ${
          value ? "border-neutral-200 text-neutral-800" : "border-neutral-200 text-neutral-400"
        }`}
      >
        {label}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-20 w-56 rounded-lg border border-neutral-200 bg-white shadow-md p-3 space-y-3">
          <div className="grid grid-cols-3 gap-1.5">
            {YEARS.map((year) => {
              // 해당 연도의 최솟값(1월)·최댓값(12월) 기준으로 비활성화 판정
              const yearMin = toMonthIndex({ year, month: 12 });
              const yearMax = toMonthIndex({ year, month: 1 });
              const isDisabled =
                (minDate != null && yearMin < toMonthIndex(minDate)) ||
                (maxDate != null && yearMax > toMonthIndex(maxDate));
              return (
                <button
                  key={year}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => !isDisabled && onChange({ year, month: value?.month ?? 1 })}
                  className={`text-body-sm py-1.5 rounded-pill transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                    value?.year === year ? "bg-primary-500 text-white" : "text-neutral-600 hover:bg-neutral-50 disabled:hover:bg-transparent"
                  }`}
                >
                  {year}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-4 gap-1.5 border-t border-neutral-100 pt-3">
            {MONTHS.map((month) => {
              const isDisabledByRange = value
                ? (minDate != null && toMonthIndex({ year: value.year, month }) < toMonthIndex(minDate)) ||
                  (maxDate != null && toMonthIndex({ year: value.year, month }) > toMonthIndex(maxDate))
                : false;
              const isDisabled = !value || isDisabledByRange;
              return (
                <button
                  key={month}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => value && !isDisabledByRange && onChange({ year: value.year, month })}
                  className={`text-caption py-1 rounded-pill transition-colors disabled:text-neutral-300 disabled:cursor-not-allowed ${
                    value?.month === month ? "bg-primary-500 text-white" : "text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {month}월
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
