"use client";

import { Check } from "lucide-react";

export interface ChecklistItem {
  label: string;
  done: boolean;
  caption?: string;
  sectionId?: string;
}

export default function ProgressChecklist({ items }: { items: ChecklistItem[] }) {
  const percent = items.length === 0 ? 0 : Math.round((items.filter((i) => i.done).length / items.length) * 100);

  const handleClick = (sectionId?: string) => {
    if (!sectionId) return;
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-0 p-6 space-y-4">
      <div className="flex items-center justify-between text-body-sm">
        <span className="font-medium text-neutral-800">완성도</span>
        <span className="text-h3 font-bold text-neutral-900">{percent}%</span>
      </div>
      <div className="w-full h-[6px] rounded-pill bg-neutral-100 overflow-hidden">
        <div
          className="h-full bg-primary-500 transition-[width] duration-[.4s] ease-[cubic-bezier(.22,.61,.36,1)]"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.label}>
            <button
              type="button"
              onClick={() => handleClick(item.sectionId)}
              disabled={item.done || !item.sectionId}
              className={`w-full text-left flex items-start gap-2 ${item.sectionId && !item.done ? "cursor-pointer" : "cursor-default"}`}
            >
              {item.done ? (
                <Check size={16} className="text-primary-500 shrink-0 mt-0.5" />
              ) : (
                <span className="w-4 h-4 rounded-full border-2 border-neutral-300 shrink-0 mt-0.5" />
              )}
              <span className="min-w-0">
                <span className={`block text-body-sm ${item.done ? "text-neutral-400" : "text-neutral-700"}`}>
                  {item.label}
                </span>
                {!item.done && item.caption && <span className="block text-caption text-neutral-400 mt-0.5">{item.caption}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
