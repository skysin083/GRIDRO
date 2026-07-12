"use client";

import { useEffect, useState } from "react";
import { CareerEntry } from "@/types/profile";
import { PARTS } from "@/lib/constants";
import Input from "@/components/ui/Input";
import TagSelect from "@/components/TagSelect";
import YearPicker from "@/components/ui/YearPicker";

function emptyCareer(): CareerEntry {
  return {
    id: `career-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    startYear: null,
    startMonth: null,
    endYear: null,
    endMonth: null,
    parts: [],
    link: "",
  };
}

function CareerCard({
  entry,
  onUpdate,
  onRemove,
}: {
  entry: CareerEntry;
  onUpdate: (patch: Partial<CareerEntry>) => void;
  onRemove: () => void;
}) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={`bg-neutral-50 rounded-md p-5 space-y-3 transition-all duration-[.25s] ease-[cubic-bezier(.22,.61,.36,1)] ${
        entered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1.5"
      }`}
    >
      <div className="flex items-center justify-between">
        <Input
          value={entry.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="작품명 / 활동명"
          className="max-w-xs"
        />
        <button
          type="button"
          onClick={onRemove}
          className="text-caption text-neutral-400 hover:text-danger transition-colors ml-3 shrink-0"
        >
          삭제
        </button>
      </div>

      <div className="flex items-center gap-2 text-body-sm text-neutral-500">
        <YearPicker
          value={entry.startYear ? { year: entry.startYear, month: entry.startMonth ?? 1 } : null}
          onChange={(v) => onUpdate({ startYear: v.year, startMonth: v.month })}
          placeholder="시작 YYYY.MM"
        />
        <span>~</span>
        <YearPicker
          value={entry.endYear ? { year: entry.endYear, month: entry.endMonth ?? 1 } : null}
          onChange={(v) => onUpdate({ endYear: v.year, endMonth: v.month })}
          placeholder="종료 YYYY.MM"
        />
      </div>

      <TagSelect options={PARTS} selected={entry.parts} onChange={(parts) => onUpdate({ parts })} />

      <Input value={entry.link} onChange={(e) => onUpdate({ link: e.target.value })} placeholder="링크 (선택)" />
    </div>
  );
}

interface CareerFieldsProps {
  careers: CareerEntry[];
  onChange: (careers: CareerEntry[]) => void;
  isNewcomer: boolean;
}

export default function CareerFields({ careers, onChange, isNewcomer }: CareerFieldsProps) {
  const update = (id: string, patch: Partial<CareerEntry>) =>
    onChange(careers.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const remove = (id: string) => onChange(careers.filter((c) => c.id !== id));
  const add = () => onChange([...careers, emptyCareer()]);

  return (
    <div className={isNewcomer ? "opacity-40 pointer-events-none" : ""}>
      <div className="space-y-4">
        {careers.map((entry) => (
          <CareerCard
            key={entry.id}
            entry={entry}
            onUpdate={(patch) => update(entry.id, patch)}
            onRemove={() => remove(entry.id)}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        disabled={isNewcomer}
        className="mt-3 w-full py-3 rounded-md border border-dashed border-neutral-300 text-body-sm text-neutral-500 transition-colors hover:border-primary-300 hover:text-primary-600"
      >
        + 경력 추가
      </button>
    </div>
  );
}
