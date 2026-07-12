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
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 12 }, (_, i) => CURRENT_YEAR - i).reverse();
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function YearPicker({ value, onChange, placeholder = "YYYY.MM" }: YearPickerProps) {
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
            {YEARS.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => onChange({ year, month: value?.month ?? 1 })}
                className={`text-body-sm py-1.5 rounded-pill transition-colors ${
                  value?.year === year ? "bg-primary-500 text-white" : "text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1.5 border-t border-neutral-100 pt-3">
            {MONTHS.map((month) => (
              <button
                key={month}
                type="button"
                disabled={!value}
                onClick={() => value && onChange({ year: value.year, month })}
                className={`text-caption py-1 rounded-pill transition-colors disabled:text-neutral-300 ${
                  value?.month === month ? "bg-primary-500 text-white" : "text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {month}월
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
