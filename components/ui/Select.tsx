"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (rect) setPos({ top: rect.bottom + 8, left: rect.left });
    };
    updatePosition();

    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleScroll = () => setOpen(false);
    // AH-8: transform을 쓰는 조상(예: 경력 카드 진입 애니메이션)이 새 containing block을 만들어
    // 드롭다운이 뒤 섹션에 깔리는 문제 — body로 포탈해 스택 컨텍스트를 완전히 벗어난다.
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", updatePosition);
    };
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

      {open &&
        createPortal(
          <div
            style={{ position: "fixed", top: pos.top, left: pos.left }}
            className="z-50 w-44 rounded-lg border border-neutral-200 bg-white shadow-md p-1.5 space-y-0.5"
          >
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
          </div>,
          document.body
        )}
    </div>
  );
}
