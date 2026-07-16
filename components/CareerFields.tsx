"use client";

import { useEffect, useState } from "react";
import { CareerEntry } from "@/types/profile";
import { PARTS, PLATFORMS } from "@/lib/constants";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import GenreSelect from "@/components/GenreSelect";
import YearPicker from "@/components/ui/YearPicker";

function emptyCareer(): CareerEntry {
  return {
    id: `career-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    platform: "",
    platformCustom: "",
    startYear: null,
    startMonth: null,
    endYear: null,
    endMonth: null,
    parts: [],
    memo: "",
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
    // 등장 후에는 transform을 아예 걷어낸다. translate-y-0은 값이 0이어도 쌓임 맥락을 만들어서,
    // 카드 안에서 연 날짜 드롭다운이 카드 밖으로 올라오지 못하고 아래 칩들에 덮인다.
    <div
      className={`bg-neutral-50 rounded-md p-5 space-y-3 transition-all duration-[.25s] ease-[cubic-bezier(.22,.61,.36,1)] ${
        entered ? "opacity-100" : "opacity-0 -translate-y-1.5"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <Input
          value={entry.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="참여한 작품명을 적어주세요"
          className="max-w-xs"
        />
        <button
          type="button"
          onClick={onRemove}
          className="text-caption text-neutral-400 hover:text-danger transition-colors shrink-0"
        >
          삭제
        </button>
      </div>

      <Select label="플랫폼" options={PLATFORMS} value={entry.platform} onChange={(platform) => onUpdate({ platform, platformCustom: "" })} allLabel="선택 안 함" />
      {entry.platform === "기타" && (
        <Input
          value={entry.platformCustom}
          onChange={(e) => onUpdate({ platformCustom: e.target.value })}
          placeholder="플랫폼명을 직접 적어주세요"
        />
      )}

      {/* 작업 파트와 같은 선택기를 쓴다 — 목록에 없는 파트를 직접 적을 수 있어야 한다. */}
      <GenreSelect options={PARTS} selected={entry.parts} onChange={(parts) => onUpdate({ parts })} />

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

      <Input
        value={entry.memo}
        onChange={(e) => onUpdate({ memo: e.target.value })}
        placeholder="담당 범위나 특이사항을 간단히 적어주세요"
      />

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
