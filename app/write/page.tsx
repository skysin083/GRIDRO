"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProfileStore, MAX_RESUMES } from "@/store/useProfileStore";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { CareerEntry, Profile, WorkStyle } from "@/types/profile";
import {
  PARTS,
  GENRES,
  TOOLS,
  WORK_STYLES,
  AUTHOR_TRAITS,
  WORK_TYPES,
  CONTACT_TIMES,
  PART_UPLOAD_TIPS,
  CSP_EDITION_TOOL,
  CSP_EDITIONS,
  CSP_VERSIONS,
} from "@/lib/constants";
import UploadSlot from "@/components/UploadSlot";
import TagSelect from "@/components/TagSelect";
import GenreSelect from "@/components/GenreSelect";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import ProgressChecklist, { ChecklistItem } from "@/components/ui/ProgressChecklist";
import CareerFields from "@/components/CareerFields";
import AiPasteSection from "@/components/AiPasteSection";
import PublishModal from "@/components/PublishModal";
import { useToast } from "@/components/ui/Toast";

function SingleSelectChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T | "";
  onChange: (v: T | "") => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(value === option ? "" : option)}
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

// AD-3: 폼 전체 필드가 동일한 라벨 문법(15px/600 + 13px 캡션)을 쓴다. h3급 대형 섹션 타이틀은 없다.
// AG-3: 라벨↔캡션 6px, (라벨/캡션)↔인풋 10px
function Field({
  label,
  required,
  id,
  caption,
  headerAction,
  children,
}: {
  label: string;
  required?: boolean;
  id?: string;
  caption?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="space-y-2.5 scroll-mt-24">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-neutral-800">
            {label}
            {required && <span className="text-danger">*</span>}
          </h3>
          {caption && <p className="text-[13px] text-neutral-400 mt-1.5">{caption}</p>}
        </div>
        {headerAction}
      </div>
      {children}
    </section>
  );
}

// AD-1: 체크리스트는 이 배열(=폼 순서) 하나에서만 파생된다. 폼 순서를 바꾸면 이 배열만 옮기면 된다.
// AH-7 순서 반영: 활동명·연락처·구직 제목·소개·파트·그림·장르(선호/불호)·툴·근무형태·경력·연락시간대·특징
const FIELD_ORDER = [
  { key: "nickname", label: "활동명", required: true },
  { key: "email", label: "연락처(이메일)", required: true },
  { key: "intro", label: "구직 제목", required: true },
  { key: "bio", label: "소개", required: false },
  { key: "parts", label: "작업 파트", required: true },
  { key: "images", label: "대표 그림", required: true },
  { key: "preferredGenres", label: "선호 장르", required: true },
  // UT: "구직하는 입장에서는 가릴 처지가 아닐 것 같아요"(묵해) — 필수로 강제할 항목이 아니다.
  { key: "dislikedGenres", label: "불호 장르", required: false },
  { key: "tools", label: "사용 툴", required: true },
  { key: "workType", label: "근무형태", required: true },
  { key: "careers", label: "경력", required: false },
  { key: "contactTime", label: "연락 가능 시간대", required: false },
  { key: "authorTraits", label: "작가 특징", required: false },
] as const;

const AUTOSAVE_DELAY_MS = 800;

function WritePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const editId = searchParams.get("id");
  const { user, loading: authLoading } = useRequireAuth();

  const resumes = useProfileStore((s) => s.resumes);
  const { saveResume, persistResume, publishResume } = useProfileStore((s) => s.actions);

  // D-7: 수정 모드 진입 시 기존 이력서 데이터로 초기값을 채운다 (최초 렌더 1회 기준 스냅샷).
  const initialProfile = (editId ? resumes.find((r) => r.id === editId)?.profile : undefined) ?? null;

  const [formMode, setFormMode] = useState<"manual" | "paste">("manual");
  const [resumeId, setResumeId] = useState<string | null>(editId);
  const [nickname, setNickname] = useState(initialProfile?.nickname ?? "");
  const [email, setEmail] = useState(initialProfile?.email ?? "");
  const [intro, setIntro] = useState(initialProfile?.intro ?? "");
  const [bio, setBio] = useState(initialProfile?.bio ?? "");
  const [images, setImages] = useState<string[]>(initialProfile?.images ?? []);
  const [parts, setParts] = useState<string[]>(initialProfile?.parts ?? []);
  const [preferredGenres, setPreferredGenres] = useState<string[]>(initialProfile?.preferredGenres ?? []);
  const [dislikedGenres, setDislikedGenres] = useState<string[]>(initialProfile?.dislikedGenres ?? []);
  const [toolNames, setToolNames] = useState<string[]>(initialProfile?.tools ?? []);
  const [cspEdition, setCspEdition] = useState<(typeof CSP_EDITIONS)[number] | "">(
    (initialProfile?.cspEdition as (typeof CSP_EDITIONS)[number]) ?? ""
  );
  const [cspVersion, setCspVersion] = useState<(typeof CSP_VERSIONS)[number] | "">(
    (initialProfile?.cspVersion as (typeof CSP_VERSIONS)[number]) ?? ""
  );
  const [workStyle, setWorkStyle] = useState<WorkStyle | "">(initialProfile?.workStyle ?? "");
  const [authorTraits, setAuthorTraits] = useState<string[]>(initialProfile?.authorTraits ?? []);
  const [authorTraitsNote, setAuthorTraitsNote] = useState(initialProfile?.authorTraitsNote ?? "");
  const [workTypes, setWorkTypes] = useState<string[]>(initialProfile?.workTypes ?? []);
  const [contactTimes, setContactTimes] = useState<string[]>(initialProfile?.contactTimes ?? []);
  const [contactNote, setContactNote] = useState(initialProfile?.contactNote ?? "");
  const [isNewcomer, setIsNewcomer] = useState(initialProfile?.isNewcomer ?? false);
  const [careers, setCareers] = useState<CareerEntry[]>(initialProfile?.careers ?? []);
  const [showModal, setShowModal] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [genreError, setGenreError] = useState<"preferredGenres" | null>(null);

  const canCreateNew = editId !== null || resumes.length < MAX_RESUMES;

  const draftProfile: Profile = useMemo(
    () => ({
      id: resumeId ?? "",
      nickname,
      email,
      images,
      parts,
      preferredGenres,
      dislikedGenres,
      tools: toolNames,
      // 클튜를 빼면 에디션 값도 남기지 않는다 — 안 쓰는 툴의 에디션이 카드에 남으면 안 된다.
      cspEdition: toolNames.includes(CSP_EDITION_TOOL) ? cspEdition : "",
      // 버전은 에디션을 고른 뒤에만 의미가 있다 — 에디션이 없어지면 버전도 같이 비운다.
      cspVersion: toolNames.includes(CSP_EDITION_TOOL) && cspEdition ? cspVersion : "",
      workStyle: (workStyle || "무관") as WorkStyle,
      authorTraits,
      authorTraitsNote,
      workTypes,
      contactTimes,
      contactNote,
      intro,
      bio,
      isNewcomer,
      careers,
      // 공개 전환 시점에만 store 액션(publishResume/bumpResume)이 갱신한다 — 작성 폼은 기존 값을 그대로 들고만 있는다.
      publishedAt: initialProfile?.publishedAt ?? null,
    }),
    [
      resumeId,
      nickname,
      email,
      images,
      parts,
      preferredGenres,
      dislikedGenres,
      toolNames,
      cspEdition,
      cspVersion,
      workStyle,
      authorTraits,
      authorTraitsNote,
      workTypes,
      contactTimes,
      contactNote,
      intro,
      bio,
      isNewcomer,
      careers,
      initialProfile?.publishedAt,
    ]
  );

  // 디바운스 자동저장 (세션 스토어에만 반영, 실제 항목 하나라도 채워졌을 때부터)
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

  // AD-1: FIELD_ORDER(=폼 순서) 하나에서 체크리스트·필수 검증을 전부 파생한다.
  const doneMap: Record<(typeof FIELD_ORDER)[number]["key"], boolean> = {
    nickname: nickname.trim() !== "",
    email: email.trim() !== "",
    intro: intro.trim() !== "",
    bio: bio.trim() !== "",
    parts: parts.length > 0,
    images: images.length > 0,
    preferredGenres: preferredGenres.length > 0,
    dislikedGenres: dislikedGenres.length > 0,
    tools: toolNames.length > 0,
    workType: workTypes.length > 0,
    contactTime: contactTimes.length > 0 || contactNote.trim() !== "",
    careers: careers.length > 0 || isNewcomer,
    authorTraits: authorTraits.length > 0 || authorTraitsNote.trim() !== "",
  };
  const checklistItems: ChecklistItem[] = FIELD_ORDER.filter((f) => f.required || doneMap[f.key]).map((f) => ({
    label: f.label,
    done: doneMap[f.key],
    sectionId: `field-${f.key}`,
  }));
  const requiredFields = FIELD_ORDER.filter((f) => f.required);
  const checklistPercent = Math.round(
    (requiredFields.filter((f) => doneMap[f.key]).length / requiredFields.length) * 100
  );
  const handleSubmitClick = () => {
    const firstMissing = requiredFields.find((f) => !doneMap[f.key]);
    if (firstMissing) {
      document.getElementById(`field-${firstMissing.key}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      // 불호 장르가 선택으로 바뀐 뒤로 장르 중 필수는 선호 장르 하나뿐이다.
      if (firstMissing.key === "preferredGenres") {
        setGenreError(firstMissing.key);
      }
      // 스크롤만 하면 왜 멈췄는지 알기 어려워, 남은 항목 이름을 그대로 알려준다.
      toast.show(`'${firstMissing.label}'을(를) 채워야 완료할 수 있어요`, "danger");
      return;
    }
    setGenreError(null);
    setShowModal(true);
  };

  // AH-9: 검증 없이 현재 상태를 비공개 이력서로 저장 (기존 "비공개" 상태 재사용, 모달 없음)
  const handleTempSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const savedId = await persistResume(resumeId, draftProfile);
    if (!resumeId) setResumeId(savedId);
    setLastSavedAt(Date.now());
    setIsSaving(false);
    toast.show("임시 저장했어요");
  };

  const handlePublish = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const savedId = await persistResume(resumeId, draftProfile);
    await publishResume(savedId);
    setIsSaving(false);
    toast.show("구직란에 올렸어요");
    router.push("/feed");
  };

  const handleSaveOnly = async () => {
    if (isSaving) return;
    setIsSaving(true);
    await persistResume(resumeId, draftProfile);
    setIsSaving(false);
    toast.show("'내 이력서'에 비공개로 저장했어요");
    router.push("/my");
  };

  // UT: 워밍업에서 5명 중 3명이 "어떤 그림을 올릴지 고르는 게 제일 귀찮다"고 했고 이 팁이 그 답이었는데,
  // 정작 자발적으로 알아챈 사람은 1명뿐이었다. 어느 파트의 팁인지 드러나도록 파트명을 함께 넘긴다.
  const uploadTips = parts
    .slice(0, 2)
    .map((part) => (PART_UPLOAD_TIPS[part] ? { part, tip: PART_UPLOAD_TIPS[part] } : null))
    .filter((t): t is { part: string; tip: string } => t !== null);

  if (authLoading || !user) return null;

  if (!canCreateNew) {
    return (
      <div className="max-w-[720px] mx-auto px-5 py-20 text-center space-y-4">
        <p className="text-h3 font-bold text-neutral-900">이력서는 최대 {MAX_RESUMES}개까지 만들 수 있어요</p>
        <p className="text-body-sm text-neutral-500">내 이력서에서 기존 이력서를 정리한 뒤 다시 시도해 주세요.</p>
        <Button href="/my" variant="dark-pill">
          내 이력서로 이동
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-14 pb-28">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
        <div className="max-w-[720px] space-y-5">
          <PageHeader title="이력서를 만들어볼게요." lead="필수 항목만 채우면 3분이면 끝나요." />

          {/* AI 붙여넣기 세그먼트 탭 */}
          <div className="inline-flex bg-neutral-100 rounded-md p-1 gap-1">
            <button
              type="button"
              onClick={() => setFormMode("manual")}
              className={`px-4 py-2 rounded-md text-body-sm font-medium transition-all duration-[.18s] ${
                formMode === "manual" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
              }`}
            >
              처음부터 작성
            </button>
            <button
              type="button"
              onClick={() => setFormMode("paste")}
              className={`px-4 py-2 rounded-md text-body-sm font-medium transition-all duration-[.18s] ${
                formMode === "paste" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
              }`}
            >
              붙여넣고 시작
            </button>
          </div>

          {formMode === "paste" ? (
            <AiPasteSection onComplete={() => setFormMode("manual")} />
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="활동명" required id="field-nickname">
                  <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="활동명/작가명을 입력하세요" maxLength={20} />
                </Field>
                <Field label="연락처(이메일)" required id="field-email">
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@example.com" />
                </Field>
              </div>

              {/* UT: 라벨('한줄소개')과 placeholder('제목이에요')가 서로 다른 말을 해서 구직자 5명 중 3명이 막혔다.
                  구인자는 이 자리에 "뭘 구직하는지"가 있길 원했으므로(주일) 라벨을 제목형으로 통일하고,
                  설명 대신 실제 예시를 넣는다("예시로라도 써져 있으면" — 멍군). */}
              <Field
                label="구직 제목"
                required
                id="field-intro"
                caption="구직란 카드에 크게 보이는 한 문장이에요. 어떤 파트를 구직하는지 적어주세요"
              >
                <div className="relative">
                  <Input
                    value={intro}
                    onChange={(e) => setIntro(e.target.value.slice(0, 40))}
                    // 방사 구직 글 제목 관례를 그대로 따른다("{파트} 구직합니다").
                    // '경력 O'는 시스템이 경력란으로 대신 알려주므로 제목엔 넣지 않는다.
                    placeholder="예) 웹툰 밑색·명암 구직합니다"
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

              {/* 작업 속도는 케이스마다 달라 표준 필드로 못 박는다는 반증이 있었으므로(묵해),
                  구조화 대신 여기에 자유 기재하도록 예시로 유도한다.
                  예시는 '작가 특징' 태그로 찍을 수 있는 것(수정 대응·연락·꼼꼼함)과 겹치지 않게,
                  태그로 표현 못 하는 정량 수치와 협업 방식만 담는다. */}
              <Field label="소개" id="field-bio">
                <div className="relative">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 500))}
                    placeholder="예) 컷당 3~4시간 정도 걸려요. 러프를 먼저 보여드리고 진행하는 편이에요"
                    maxLength={500}
                    rows={4}
                    className="w-full text-body-sm text-neutral-800 placeholder:text-neutral-400 bg-white border border-neutral-200 rounded-md px-4 py-[14px] pb-6 outline-none transition-colors duration-[.18s] hover:border-neutral-400 focus:border-primary-500 resize-none"
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

              {/* UT: 1·2순위 파트가 아래 대표 그림 팁을 바꾸는데, 그 연결을 아무도 눈치채지 못했다.
                  캡션에서 인과를 직접 밝힌다. */}
              <Field
                label="작업 파트"
                required
                id="field-parts"
                caption="일하고 싶은 파트부터 순서대로 골라주세요. 1·2순위에 맞춰 아래 '대표 그림' 팁이 바뀌어요"
              >
                {/* 공정이 계속 세분화돼 목록으로 다 덮을 수 없다 — 장르와 같이 직접 추가할 수 있게 둔다. */}
                <GenreSelect options={PARTS} selected={parts} onChange={setParts} rankBadges={2} />
              </Field>

              <div id="field-images" className="scroll-mt-24">
                <UploadSlot images={images} onChange={setImages} tips={uploadTips} label="대표 그림" required />
              </div>

              <Field label="선호 장르" required id="field-preferredGenres" caption="1·2순위를 정해두면 맞는 작품을 만나기 쉬워요">
                <GenreSelect
                  options={GENRES}
                  selected={preferredGenres}
                  onChange={(next) => {
                    setPreferredGenres(next);
                    if (next.length > 0) setGenreError((cur) => (cur === "preferredGenres" ? null : cur));
                  }}
                  rankBadges={2}
                  error={genreError === "preferredGenres"}
                />
              </Field>

              {/* UT: 필수라 "아예 안 받는 장르인지"를 두고 혼란이 있었다(멍군). 선택으로 풀고 의미를 캡션에서 밝힌다. */}
              <Field
                label="불호 장르"
                id="field-dislikedGenres"
                caption="안 맞는 작품을 미리 거를 수 있어요. 가리는 장르가 없다면 비워두세요"
              >
                <GenreSelect options={GENRES} selected={dislikedGenres} onChange={setDislikedGenres} rankBadges={2} />
              </Field>

              <Field label="사용 툴" required id="field-tools">
                <GenreSelect options={TOOLS} selected={toolNames} onChange={setToolNames} />
                {/* UT: "사람들 EX인지 PRO인지도 쓰더라"(재갈). 클튜만 에디션에 따라 되는 작업이 갈려서
                    (EX만 웹툰 다중 페이지 내보내기) 고른 사람에게만 한 단계 더 묻는다.
                    DEBUT은 상업 작업에서 쓰는 사람이 사실상 없어 뺐다.
                    버전은 에디션·버전 칩을 한 줄에 이어 붙여, 에디션을 고르면 그 옆에 바로 이어서 고르게 한다. */}
                {toolNames.includes(CSP_EDITION_TOOL) && (
                  <div className="mt-3 rounded-md bg-neutral-50 border border-neutral-200 px-3.5 py-3 space-y-2">
                    <p className="text-[13px] font-semibold text-neutral-700">
                      Clip Studio Paint 에디션·버전
                      <span className="ml-1.5 font-normal text-neutral-400">선택</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <SingleSelectChips options={CSP_EDITIONS} value={cspEdition} onChange={setCspEdition} />
                      {cspEdition && (
                        <>
                          <span className="text-neutral-300 select-none">/</span>
                          <SingleSelectChips options={CSP_VERSIONS} value={cspVersion} onChange={setCspVersion} />
                        </>
                      )}
                    </div>
                  </div>
                )}
              </Field>

              {/* UT: 단일 선택이라 "고정 어시/프리랜서 와리가리"하는 실제 사정을 담을 수 없었다(묵찬).
                  "다 구하는 사람이 있을 수 있잖아요"(이려원) — 복수 선택으로 연다. */}
              <Field label="근무형태" required id="field-workType">
                {/* '기타' 칩 + 별도 입력칸 대신 직접 추가로 통일했다 — 고른 말이 그대로 카드에 노출된다. */}
                <GenreSelect options={WORK_TYPES} selected={workTypes} onChange={setWorkTypes} />
              </Field>

              {/* 그룹 경계: 여기부터 경력/연락시간대/특징/성향 — 위아래 각 32px(총 64px) + 구분선 */}
              <div className="border-t border-neutral-200 pt-8">
                <Field
                  label="경력 사항"
                  id="field-careers"
                  headerAction={
                    <label className="flex items-center gap-1.5 text-body-sm text-neutral-500 cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={isNewcomer}
                        onChange={(e) => setIsNewcomer(e.target.checked)}
                        className="accent-primary-500"
                      />
                      신입
                    </label>
                  }
                >
                  <CareerFields careers={careers} onChange={setCareers} isNewcomer={isNewcomer} />
                </Field>
              </div>

              {/* 시간대는 여러 구간이 열려 있는 게 보통이라 복수 선택으로 둔다. */}
              <Field label="연락 가능 시간대" id="field-contactTime">
                <TagSelect options={CONTACT_TIMES} selected={contactTimes} onChange={setContactTimes} />
                <Input
                  value={contactNote}
                  onChange={(e) => setContactNote(e.target.value)}
                  placeholder="연락되는 시간을 적어두면 엇갈리는 연락이 줄어요 (예: 평일 14~22시)"
                  className="mt-3"
                />
              </Field>

              {/* 작성 동기("구체적으로 쓸수록...")를 caption 대신 입력칸 placeholder 안에 녹여
                  입력 전 방향을 잡아준다 — 예시는 하나만, 다른 항목과 캡션 유무 표기 일관성을 맞춘다. */}
              <Field label="작가 특징" id="field-authorTraits">
                <TagSelect options={AUTHOR_TRAITS} selected={authorTraits} onChange={setAuthorTraits} />
                <Input
                  value={authorTraitsNote}
                  onChange={(e) => setAuthorTraitsNote(e.target.value)}
                  placeholder="구체적으로 쓸수록 구인자 눈에 띄어요. 예: 수정 대응 빠름"
                  className="mt-3"
                />
              </Field>

              <Field label="작업물 성향" caption="그림체·수위가 갈리는 작품이라면 밝혀두는 게 좋아요">
                <SingleSelectChips options={WORK_STYLES} value={workStyle} onChange={setWorkStyle} />
              </Field>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-[88px] h-fit">
          <ProgressChecklist items={checklistItems} percent={checklistPercent} />
        </aside>
      </div>

      {/* 하단 고정 저장 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-t border-neutral-200">
        <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-3 flex items-center justify-between">
          <span className="text-caption text-neutral-400">{lastSavedAt ? "방금 저장됨" : "작성을 시작해 주세요"}</span>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleTempSave} disabled={isSaving}>
              {isSaving ? "저장 중…" : "임시 저장"}
            </Button>
            <Button variant="dark-pill" arrow onClick={handleSubmitClick}>
              작성 완료
            </Button>
          </div>
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
