"use client";

import { useEffect, useState } from "react";
import { CareerEntry } from "@/types/profile";
import { PARTS, PLATFORMS, SERIAL_CYCLES } from "@/lib/constants";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import MultiSelect from "@/components/ui/MultiSelect";
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
    serialCycle: "",
  };
}

function CareerCard({
  entry,
  index,
  onUpdate,
  onRemove,
}: {
  entry: CareerEntry;
  index: number;
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
      {/* justify-between이 늘어나지 않는 요소 셋(라벨·인풋·삭제)을 행 전체에 고르게 벌려놔서
          라벨이 인풋과 붙지 않고 혼자 뚝 떨어져 보였다 — 인풋이 남는 공간을 직접 채우게 하고
          삭제만 ml-auto로 오른쪽 끝에 붙인다. */}
      <div className="flex items-center gap-3">
        <span className="text-caption font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-sm shrink-0">
          경력 {index + 1}
        </span>
        <Input
          value={entry.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="참여한 작품명을 적어주세요"
          className="flex-1 max-w-xs"
        />
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto text-caption text-neutral-400 hover:text-danger transition-colors shrink-0"
        >
          삭제
        </button>
      </div>

      {/* 플랫폼 + 작업파트를 같은 행에 — 두 드롭다운이 나란히 있어 카드 높이를 줄인다 */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select
          label="플랫폼"
          options={PLATFORMS}
          value={entry.platform}
          onChange={(platform) => onUpdate({ platform, platformCustom: "" })}
          allLabel="선택 안 함"
        />
        <MultiSelect
          label="작업 파트"
          options={PARTS}
          value={entry.parts}
          onChange={(parts) => onUpdate({ parts })}
          allLabel="선택 안 함"
        />
        <Select
          label="연재 주기"
          options={SERIAL_CYCLES}
          value={entry.serialCycle ?? ""}
          onChange={(serialCycle) => onUpdate({ serialCycle })}
          allLabel="선택 안 함"
        />
      </div>
      {entry.platform === "기타" && (
        <Input
          value={entry.platformCustom}
          onChange={(e) => onUpdate({ platformCustom: e.target.value })}
          placeholder="플랫폼명을 직접 적어주세요"
        />
      )}

      <div className="flex items-center gap-2 text-body-sm text-neutral-500">
        <YearPicker
          value={entry.startYear ? { year: entry.startYear, month: entry.startMonth ?? 1 } : null}
          onChange={(v) => onUpdate({ startYear: v.year, startMonth: v.month })}
          placeholder="시작 YYYY.MM"
          maxDate={entry.endYear ? { year: entry.endYear, month: entry.endMonth ?? 1 } : null}
        />
        <span>~</span>
        <YearPicker
          value={entry.endYear ? { year: entry.endYear, month: entry.endMonth ?? 1 } : null}
          onChange={(v) => onUpdate({ endYear: v.year, endMonth: v.month })}
          placeholder="종료 YYYY.MM"
          minDate={entry.startYear ? { year: entry.startYear, month: entry.startMonth ?? 1 } : null}
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
        {careers.map((entry, i) => (
          <CareerCard
            key={entry.id}
            entry={entry}
            index={i}
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
