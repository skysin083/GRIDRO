"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  allLabel?: string;
}

export default function Select({ label, options, value, onChange, allLabel = "전체" }: SelectProps) {
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

  const displayLabel = value || `${label} ${allLabel}`;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 text-body-sm px-3 py-1.5 rounded-pill border transition-colors ${
          value
            ? "bg-primary-50 border-primary-200 text-primary-700"
            : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
        }`}
      >
        {displayLabel}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-20 w-44 rounded-lg border border-neutral-200 bg-white shadow-md p-1.5 space-y-0.5">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`w-full text-left text-body-sm px-3 py-2 rounded-md transition-colors ${
              !value ? "bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {allLabel}
          </button>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`w-full text-left text-body-sm px-3 py-2 rounded-md transition-colors ${
                value === option ? "bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
