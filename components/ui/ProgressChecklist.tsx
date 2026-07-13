"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

export interface ChecklistItem {
  label: string;
  done: boolean;
  caption?: string;
  sectionId?: string;
}

function ChecklistRow({ item, onClick }: { item: ChecklistItem; onClick: () => void }) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <li className={`transition-opacity duration-[.25s] ease-[cubic-bezier(.22,.61,.36,1)] ${entered ? "opacity-100" : "opacity-0"}`}>
      <button
        type="button"
        onClick={onClick}
        disabled={item.done || !item.sectionId}
        className={`w-full text-left flex items-start gap-2 ${item.sectionId && !item.done ? "cursor-pointer" : "cursor-default"}`}
      >
        {item.done ? (
          <Check size={16} className="text-primary-500 shrink-0 mt-0.5" />
        ) : (
          <span className="w-4 h-4 rounded-full border-2 border-neutral-300 shrink-0 mt-0.5" />
        )}
        <span className="min-w-0">
          <span className={`block text-body-sm ${item.done ? "text-neutral-400" : "text-neutral-700"}`}>{item.label}</span>
          {!item.done && item.caption && <span className="block text-caption text-neutral-400 mt-0.5">{item.caption}</span>}
        </span>
      </button>
    </li>
  );
}

interface ProgressChecklistProps {
  items: ChecklistItem[];
  /** Override the auto-computed (done/total) percent — use when items includes entries that shouldn't count toward the total. */
  percent?: number;
}

export default function ProgressChecklist({ items, percent }: ProgressChecklistProps) {
  const computedPercent = items.length === 0 ? 0 : Math.round((items.filter((i) => i.done).length / items.length) * 100);
  const shownPercent = percent ?? computedPercent;

  const handleClick = (sectionId?: string) => {
    if (!sectionId) return;
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-0 p-6 space-y-4">
      <div className="flex items-center justify-between text-body-sm">
        <span className="font-medium text-neutral-800">완성도</span>
        <span className="text-h3 font-bold text-neutral-900">{shownPercent}%</span>
      </div>
      <div className="w-full h-[6px] rounded-pill bg-neutral-100 overflow-hidden">
        <div
          className="h-full bg-primary-500 transition-[width] duration-[.4s] ease-[cubic-bezier(.22,.61,.36,1)]"
          style={{ width: `${shownPercent}%` }}
        />
      </div>

      <ul className="space-y-3">
        {items.map((item) => (
          <ChecklistRow key={item.label} item={item} onClick={() => handleClick(item.sectionId)} />
        ))}
      </ul>
    </div>
  );
}
