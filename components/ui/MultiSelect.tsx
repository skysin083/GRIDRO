"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

interface MultiSelectProps {
  label: string;
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  allLabel?: string;
}

export default function MultiSelect({ label, options, value, onChange, allLabel = "전체" }: MultiSelectProps) {
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
    // Select.tsx의 AH-8/AL-1 수정과 동일: 포탈 패널 내부 mousedown이 document까지 버블링되면
    // 옵션 클릭 시 click 이벤트가 도달하기 전에 패널이 먼저 닫혀 선택이 씹힌다.
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  const toggle = (option: string) => {
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);
  };

  const displayLabel = value.length > 0 ? `${label} ${value.length}` : `${label} ${allLabel}`;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 text-body-sm px-3 py-1.5 rounded-pill border transition-colors ${
          value.length > 0
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
            onMouseDown={(e) => e.stopPropagation()}
            className={`z-50 rounded-lg border border-neutral-200 bg-white shadow-md p-1.5 ${
              options.length >= 7 ? "w-56" : "w-44"
            }`}
          >
            {/* '전체' 리셋은 전체 너비 단독 배치 */}
            <button
              type="button"
              onClick={() => onChange([])}
              className={`w-full text-left text-body-sm px-3 py-2 rounded-md transition-colors mb-1 ${
                value.length === 0 ? "bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {allLabel}
            </button>
            {/* 7개 이상이면 2열, 미만이면 1열 */}
            <div className={options.length >= 7 ? "grid grid-cols-2 gap-0.5" : "space-y-0.5"}>
              {options.map((option) => {
                const checked = value.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggle(option)}
                    className={`w-full flex items-center gap-1.5 text-left text-body-sm px-2.5 py-2 rounded-md transition-colors ${
                      checked ? "bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 shrink-0 rounded border flex items-center justify-center transition-colors ${
                        checked ? "bg-neutral-900 border-neutral-900" : "border-neutral-300"
                      }`}
                    >
                      {checked && <Check size={10} className="text-white" />}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
