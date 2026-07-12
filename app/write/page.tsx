"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProfileStore, MAX_RESUMES } from "@/store/useProfileStore";
import { CareerEntry, Profile, ToolLevel, ToolSkill, WorkStyle } from "@/types/profile";
import {
  PARTS,
  GENRES,
  TOOLS,
  TOOL_LEVELS,
  WORK_STYLES,
  AUTHOR_TRAITS,
  WORK_TYPES,
  CONTACT_TIMES,
  FIELD_TOOLTIPS,
  PART_UPLOAD_TIPS,
} from "@/lib/constants";
import UploadSlot from "@/components/UploadSlot";
import TagSelect from "@/components/TagSelect";
import Tooltip from "@/components/Tooltip";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import ProgressChecklist, { ChecklistItem } from "@/components/ui/ProgressChecklist";
import CareerFields from "@/components/CareerFields";
import AiPasteSection from "@/components/AiPasteSection";
import PublishModal from "@/components/PublishModal";

function SingleSelectChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T | "";
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`text-body-sm px-3 py-1.5 rounded-pill border transition-colors duration-[.18s] ${
            value === option
              ? "bg-primary-50 text-primary-700 border-primary-500"
              : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  fieldKey,
  required,
  id,
  children,
}: {
  label: string;
  fieldKey: string;
  required?: boolean;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="space-y-2 scroll-mt-24">
      <h3 className="text-body-sm font-semibold text-neutral-800">
        {label}
        {required && <span className="text-danger">*</span>}
        <Tooltip text={FIELD_TOOLTIPS[fieldKey]} />
      </h3>
      {children}
    </section>
  );
}

const AUTOSAVE_DELAY_MS = 800;

function WritePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const resumes = useProfileStore((s) => s.resumes);
  const { saveResume, publishResume } = useProfileStore((s) => s.actions);

  // D-7: 수정 모드 진입 시 기존 이력서 데이터로 초기값을 채운다 (최초 렌더 1회 기준 스냅샷).
  const initialProfile = (editId ? resumes.find((r) => r.id === editId)?.profile : undefined) ?? null;

  const [resumeId, setResumeId] = useState<string | null>(editId);
  const [nickname, setNickname] = useState(initialProfile?.nickname ?? "");
  const [email, setEmail] = useState(initialProfile?.email ?? "");
  const [intro, setIntro] = useState(initialProfile?.intro ?? "");
  const [bio, setBio] = useState(initialProfile?.bio ?? "");
  const [images, setImages] = useState<string[]>(initialProfile?.images ?? []);
  const [parts, setParts] = useState<string[]>(initialProfile?.parts ?? []);
  const [preferredGenres, setPreferredGenres] = useState<string[]>(initialProfile?.preferredGenres ?? []);
  const [dislikedGenres, setDislikedGenres] = useState<string[]>(initialProfile?.dislikedGenres ?? []);
  const [toolNames, setToolNames] = useState<string[]>(initialProfile?.tools.map((t) => t.name) ?? []);
  const [toolLevels, setToolLevels] = useState<Record<string, ToolLevel>>(
    initialProfile ? Object.fromEntries(initialProfile.tools.map((t) => [t.name, t.level])) : {}
  );
  const [workStyle, setWorkStyle] = useState<WorkStyle | "">(initialProfile?.workStyle ?? "");
  const [authorTraits, setAuthorTraits] = useState<string[]>(initialProfile?.authorTraits ?? []);
  const [authorTraitsNote, setAuthorTraitsNote] = useState(initialProfile?.authorTraitsNote ?? "");
  const [workType, setWorkType] = useState(initialProfile?.workType ?? "");
  const [contactTime, setContactTime] = useState(initialProfile?.contactTime ?? "");
  const [contactNote, setContactNote] = useState(initialProfile?.contactNote ?? "");
  const [isNewcomer, setIsNewcomer] = useState(initialProfile?.isNewcomer ?? false);
  const [careers, setCareers] = useState<CareerEntry[]>(initialProfile?.careers ?? []);
  const [showModal, setShowModal] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const toggleToolName = (names: string[]) => {
    setToolNames(names);
    setToolLevels((prev) => {
      const next: Record<string, ToolLevel> = {};
      for (const name of names) next[name] = prev[name] ?? "중급";
      return next;
    });
  };

  const tools: ToolSkill[] = toolNames.map((name) => ({
    name,
    level: toolLevels[name] ?? "중급",
  }));

  const canCreateNew = editId !== null || resumes.length < MAX_RESUMES;

  const canSubmit =
    canCreateNew &&
    images.length > 0 &&
    parts.length > 0 &&
    nickname.trim() !== "" &&
    email.trim() !== "" &&
    intro.trim() !== "" &&
    workType !== "" &&
    tools.length > 0;

  const draftProfile: Profile = useMemo(
    () => ({
      id: resumeId ?? "",
      nickname,
      email,
      images,
      parts,
      preferredGenres,
      dislikedGenres,
      tools,
      workStyle: (workStyle || "무관") as WorkStyle,
      authorTraits,
      authorTraitsNote,
      workType,
      contactTime,
      contactNote,
      intro,
      bio,
      isNewcomer,
      careers,
    }),
    [
      resumeId,
      nickname,
      email,
      images,
      parts,
      preferredGenres,
      dislikedGenres,
      tools,
      workStyle,
      authorTraits,
      authorTraitsNote,
      workType,
      contactTime,
      contactNote,
      intro,
      bio,
      isNewcomer,
      careers,
    ]
  );

  // M-9: 디바운스 자동저장 (세션 스토어에만 반영, 실제 항목 하나라도 채워졌을 때부터)
  useEffect(() => {
    if (!canCreateNew) return;
    const hasAnyInput = nickname || email || intro || images.length > 0 || parts.length > 0;
    if (!hasAnyInput) return;
    const timer = setTimeout(() => {
      const savedId = saveResume(resumeId, draftProfile);
      if (!resumeId) setResumeId(savedId);
      setLastSavedAt(Date.now());
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftProfile]);

  const checklistItems: ChecklistItem[] = [
    { label: "활동명", done: nickname.trim() !== "", sectionId: "field-nickname" },
    { label: "연락처(이메일)", done: email.trim() !== "", sectionId: "field-email" },
    { label: "한줄소개", done: intro.trim() !== "", sectionId: "field-intro" },
    { label: "대표 그림", done: images.length > 0, sectionId: "field-images" },
    { label: "작업 파트", done: parts.length > 0, sectionId: "field-parts" },
    { label: "근무형태", done: workType !== "", sectionId: "field-workType" },
    { label: "사용 툴", done: tools.length > 0, sectionId: "field-tools" },
    {
      label: "선호 장르",
      done: preferredGenres.length > 0,
      caption: "쓰면 컨택이 빨라져요",
      sectionId: "field-preferredGenres",
    },
    { label: "소개", done: bio.trim() !== "", caption: "쓰면 컨택이 빨라져요", sectionId: "field-bio" },
    { label: "경력", done: careers.length > 0 || isNewcomer, caption: "쓰면 컨택이 빨라져요", sectionId: "field-careers" },
  ];

  const handlePublish = () => {
    const savedId = saveResume(resumeId, draftProfile);
    publishResume(savedId);
    router.push("/feed");
  };

  const handleSaveOnly = () => {
    saveResume(resumeId, draftProfile);
    router.push("/my");
  };

  const uploadTip = parts[0] ? PART_UPLOAD_TIPS[parts[0]] : undefined;

  if (!canCreateNew) {
    return (
      <div className="max-w-[720px] mx-auto px-5 py-20 text-center space-y-4">
        <p className="text-h3 font-bold text-neutral-900">이력서는 최대 {MAX_RESUMES}개까지 만들 수 있어요</p>
        <p className="text-body-sm text-neutral-500">이력서 탭에서 기존 이력서를 정리한 뒤 다시 시도해 주세요.</p>
        <Button href="/my" variant="dark-pill">
          이력서 탭으로 이동
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-14 pb-28">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
        <div className="max-w-[720px] space-y-12">
          <PageHeader eyebrow="이력서" title="구직글을 만들어볼게요." lead="필수 항목만 채우면 3분이면 끝나요." />

          <div className="space-y-6 border-t border-neutral-200 pt-6">
            <h3 className="text-h3 font-semibold text-neutral-900">필수 정보</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="활동명" fieldKey="nickname" required id="field-nickname">
                <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="닉네임을 입력하세요" maxLength={20} />
              </Field>
              <Field label="연락처(이메일)" fieldKey="email" required id="field-email">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@example.com" />
              </Field>
            </div>

            <Field label="한줄소개" fieldKey="intro" required id="field-intro">
              <div className="relative">
                <Input
                  value={intro}
                  onChange={(e) => setIntro(e.target.value.slice(0, 40))}
                  placeholder="카드에 노출될 한 문장을 적어주세요 (최대 40자)"
                  maxLength={40}
                  className="pr-14"
                />
                <span
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-caption font-semibold ${
                    intro.length >= 40 ? "text-danger" : intro.length >= 32 ? "text-primary-500" : "text-neutral-400"
                  }`}
                >
                  {intro.length}/40
                </span>
              </div>
            </Field>

            <Field label="소개" fieldKey="bio" id="field-bio">
              <div className="relative">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 500))}
                  placeholder="작업 스타일, 협업 방식 등 자유롭게 적어주세요"
                  maxLength={500}
                  rows={4}
                  className="w-full text-body-sm text-neutral-800 placeholder:text-neutral-400 bg-white border border-neutral-200 rounded-md px-4 py-[14px] pb-6 outline-none transition-colors duration-[.18s] hover:border-neutral-400 focus:border-primary-500 focus:ring-[3px] focus:ring-primary-50 resize-none"
                />
                <span
                  className={`absolute right-3 bottom-2 text-caption font-semibold ${
                    bio.length >= 500 ? "text-danger" : bio.length >= 400 ? "text-primary-500" : "text-neutral-400"
                  }`}
                >
                  {bio.length}/500
                </span>
              </div>
            </Field>

            <Field label="작업 파트" fieldKey="parts" required id="field-parts">
              <TagSelect options={PARTS} selected={parts} onChange={setParts} />
            </Field>

            <Field label="선호 장르" fieldKey="preferredGenres" id="field-preferredGenres">
              <TagSelect options={GENRES} selected={preferredGenres} onChange={setPreferredGenres} />
            </Field>

            <Field label="불호 장르" fieldKey="dislikedGenres">
              <TagSelect options={GENRES} selected={dislikedGenres} onChange={setDislikedGenres} />
            </Field>

            <Field label="대표 그림 (최대 10장)" fieldKey="images" required id="field-images">
              <UploadSlot images={images} onChange={setImages} tip={uploadTip} />
            </Field>

            <Field label="근무형태" fieldKey="workType" required id="field-workType">
              <SingleSelectChips options={WORK_TYPES} value={workType} onChange={setWorkType} />
            </Field>

            <Field label="사용 툴" fieldKey="tools" required id="field-tools">
              <TagSelect options={TOOLS} selected={toolNames} onChange={toggleToolName} />
              {toolNames.length > 0 && (
                <div className="space-y-2 pt-1">
                  {toolNames.map((name) => (
                    <div key={name} className="flex items-center gap-2 text-body-sm">
                      <span className="w-36 text-neutral-600">{name}</span>
                      <SingleSelectChips
                        options={TOOL_LEVELS}
                        value={toolLevels[name] ?? "중급"}
                        onChange={(level) => setToolLevels((prev) => ({ ...prev, [name]: level }))}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Field>

            <section id="field-careers" className="space-y-3 scroll-mt-24">
              <div className="flex items-center justify-between">
                <h3 className="text-body-sm font-semibold text-neutral-800">경력 사항</h3>
                <label className="flex items-center gap-1.5 text-body-sm text-neutral-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isNewcomer}
                    onChange={(e) => setIsNewcomer(e.target.checked)}
                    className="accent-primary-500"
                  />
                  신입
                </label>
              </div>
              <CareerFields careers={careers} onChange={setCareers} isNewcomer={isNewcomer} />
            </section>
          </div>

          <CollapsibleSection title="작업물 성향" caption="쓰면 컨택이 빨라져요">
            <SingleSelectChips options={WORK_STYLES} value={workStyle} onChange={setWorkStyle} />
          </CollapsibleSection>

          <CollapsibleSection title="작가 특징" caption="쓰면 컨택이 빨라져요">
            <TagSelect options={AUTHOR_TRAITS} selected={authorTraits} onChange={setAuthorTraits} />
            <Input
              value={authorTraitsNote}
              onChange={(e) => setAuthorTraitsNote(e.target.value)}
              placeholder="여기에 없는 특징을 직접 적어주세요"
              className="mt-3"
            />
          </CollapsibleSection>

          <CollapsibleSection title="연락 가능 시간대" caption="쓰면 컨택이 빨라져요">
            <SingleSelectChips options={CONTACT_TIMES} value={contactTime} onChange={setContactTime} />
            <Input
              value={contactNote}
              onChange={(e) => setContactNote(e.target.value)}
              placeholder="여기에 없는 시간대를 직접 적어주세요"
              className="mt-3"
            />
          </CollapsibleSection>

          <AiPasteSection />
        </div>

        <aside className="lg:sticky lg:top-[88px] h-fit">
          <ProgressChecklist items={checklistItems} />
        </aside>
      </div>

      {/* M-9 하단 고정 저장 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-t border-neutral-200">
        <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-3 flex items-center justify-between">
          <span className="text-caption text-neutral-400">{lastSavedAt ? "방금 저장됨" : "작성을 시작해 주세요"}</span>
          <Button variant="dark-pill" disabled={!canSubmit} arrow onClick={() => setShowModal(true)}>
            작성 완료
          </Button>
        </div>
      </div>

      {showModal && (
        <PublishModal
          profile={draftProfile}
          onPublish={handlePublish}
          onSaveOnly={handleSaveOnly}
          onEditMore={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default function WritePage() {
  return (
    <Suspense fallback={null}>
      <WritePageInner />
    </Suspense>
  );
}
