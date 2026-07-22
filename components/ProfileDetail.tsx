"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Download,
  Pen,
  ChevronUp,
} from "lucide-react";
import { useProfileById } from "@/lib/getProfileById";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { useProfileStore } from "@/store/useProfileStore";
import { usePublishRequest } from "@/lib/usePublishRequest";
import { track } from "@/lib/mixpanel";
import { CSP_EDITION_TOOL } from "@/lib/constants";
import { CareerEntry } from "@/types/profile";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import ContactModal from "@/components/ContactModal";
import ImageZoom from "@/components/ImageZoom";

const THUMBS_PER_PAGE = 5;
const SWIPE_THRESHOLD_RATIO = 0.15;
const SLIDE_TRANSITION = "transform .25s cubic-bezier(.22,.61,.36,1)";

// --- 정보 행 ---
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-caption font-bold text-neutral-400 tracking-[.04em] mb-1">{label}</p>
      <p className="text-[15px] leading-[1.6] text-neutral-800">{value}</p>
    </div>
  );
}

// --- 선호·불호 장르 분리 표시 ---
// 제목 아래 Tag 칩(bg-primary-50 text-primary-700 등 색 채움)과 겹쳐 보이지 않도록
// 여기는 테두리만 있는 아웃라인 스타일로 둔다 — 채움 색은 상단 칩의 몫으로 남겨둔다.
function GenrePreferenceRows({ preferred, disliked }: { preferred: string[]; disliked: string[] }) {
  return (
    <>
      <div>
        <p className="text-caption font-bold text-neutral-400 tracking-[.04em] mb-1.5">선호 장르</p>
        <div className="flex flex-wrap gap-1.5">
          {preferred.length > 0 ? (
            preferred.map((g) => (
              <span
                key={g}
                className="inline-block text-caption px-2 py-0.5 rounded-sm border border-neutral-300 text-neutral-600 font-medium"
              >
                {g}
              </span>
            ))
          ) : (
            <span className="text-[15px] text-neutral-400">-</span>
          )}
        </div>
      </div>
      {disliked.length > 0 && (
        <div>
          <p className="text-caption font-bold text-neutral-400 tracking-[.04em] mb-1.5">불호 장르</p>
          <div className="flex flex-wrap gap-1.5">
            {disliked.map((g) => (
              <span
                key={g}
                className="inline-block text-caption px-2 py-0.5 rounded-sm border border-red-200 text-red-500 font-medium"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// --- 칩 대신 줄바꿈으로 "고른 것"과 "직접 쓴 것"을 구분하는 행. 작가 특징·연락 가능
// 시간대 둘 다 같은 모양(선택 항목 + 자유 기재)이라 하나로 공유한다. ---
function ChoiceAndNoteRow({ label, choices, note }: { label: string; choices: string[]; note: string }) {
  if (choices.length === 0 && !note) return null;
  return (
    <div>
      <p className="text-caption font-bold text-neutral-400 tracking-[.04em] mb-1">{label}</p>
      {choices.length > 0 && <p className="text-[15px] leading-[1.6] text-neutral-800">{choices.join(", ")}</p>}
      {note && <p className="text-[15px] leading-[1.6] text-neutral-600 mt-0.5">{note}</p>}
    </div>
  );
}

function formatPeriod(entry: CareerEntry) {
  const start = entry.startYear ? `${entry.startYear}.${String(entry.startMonth ?? 1).padStart(2, "0")}` : "";
  const end = entry.endYear ? `${entry.endYear}.${String(entry.endMonth ?? 1).padStart(2, "0")}` : "";
  if (!start && !end) return "";
  return `${start}~${end}`;
}

function CareerInfoRow({ careers }: { careers: CareerEntry[] }) {
  if (careers.length === 0) return null;
  return (
    <div>
      <p className="text-caption font-bold text-neutral-400 tracking-[.04em] mb-1">경력</p>
      <div className="space-y-2">
        {careers.map((c, i) => {
          const platformLabel = c.platform === "기타" ? c.platformCustom : c.platform;
          const cycle = c.serialCycle || "";
          return (
            <div key={c.id}>
              <p className="text-[15px] leading-[1.6] text-neutral-800">
                <span className="text-caption font-bold text-primary-600 mr-1.5">경력 {i + 1}</span>
                {[c.title, platformLabel, cycle, formatPeriod(c)].filter(Boolean).join(" · ")}
              </p>
              {c.memo && <p className="text-[13px] text-neutral-500">{c.memo}</p>}
              {c.link.trim() && (
                <a
                  href={c.link.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[13px] text-primary-600 underline underline-offset-2 hover:text-primary-700 break-all"
                >
                  작품 보러 가기
                  <ExternalLink size={12} className="shrink-0" />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- 본인 이력서 액션 버튼 (시각 구분 강화) ---
function ActionButtons({
  isOwnResume,
  isPublished,
  id,
  onContact,
  onTogglePublish,
  bookmarked,
  onToggleBookmark,
  stackClassName = "",
}: {
  isOwnResume: boolean;
  isPublished: boolean;
  id: string;
  onContact: () => void;
  onTogglePublish: () => void;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  stackClassName?: string;
}) {
  if (isOwnResume) {
    return (
      <div className={`flex flex-col gap-2 ${stackClassName}`}>
        <Button
          variant={isPublished ? "outline" : "dark-pill"}
          className="w-full"
          onClick={onTogglePublish}
        >
          {isPublished ? "비공개로 전환" : "구직란에 올리기"}
        </Button>
        <Button variant="dark-pill" className="w-full" href={`/write?id=${id}&entry=my_tab`}>
          <Pen size={14} className="mr-1.5" />
          수정하기
        </Button>
        {/* PDF 저장은 앞의 두 개(공개 전환·수정)만큼 자주 누르는 액션이 아니라, 같은 무게의
            버튼 세 개가 나란히 있으면 오히려 뭐가 중요한 액션인지 구별이 안 됐다. 작은 텍스트
            링크로 격을 낮춰 분리한다. */}
        <div className="flex flex-col items-center gap-1 pt-1">
          <a
            href={`/profile/${id}?print=1`}
            className="inline-flex items-center gap-1.5 text-caption font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <Download size={13} />
            PDF로 저장
          </a>
          <p className="text-[11px] text-neutral-400 text-center leading-tight">
            인쇄창에서 &lsquo;머리글과 바닥글&rsquo;을 꺼두면 날짜·링크 없이 깔끔하게 저장돼요
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-2 ${stackClassName}`}>
      <Button
        variant="dark-pill"
        className="flex-1"
        onClick={() => {
          track("contact_clicked");
          onContact();
        }}
      >
        컨택하기
      </Button>
      <button
        type="button"
        onClick={() => {
          track(bookmarked ? "bookmark_removed" : "bookmark_added", { source: "detail", profile_id: id });
          onToggleBookmark();
        }}
        aria-label="북마크"
        aria-pressed={bookmarked}
        className={`w-11 h-11 shrink-0 rounded-pill border flex items-center justify-center transition-colors ${
          bookmarked
            ? "bg-white border-primary-500 text-primary-600"
            : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-400"
        }`}
      >
        <Bookmark size={17} strokeWidth={1.75} className={bookmarked ? "fill-primary-500" : "fill-transparent"} />
      </button>
    </div>
  );
}

// --- 맨 위로 스크롤 버튼 ---
// 모바일에서는 하단 고정 액션 바와 겹치는 문제가 반복돼 데스크톱에서만 보여준다.
function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 w-11 h-11 rounded-full bg-white text-neutral-700 border border-neutral-200 hidden md:flex items-center justify-center shadow-lg transition-all duration-[.25s] hover:border-neutral-400 hover:scale-110 print:hidden"
      aria-label="맨 위로"
    >
      <ChevronUp size={20} />
    </button>
  );
}

function ProfileDetailInner({ id }: { id: string }) {
  const { profile, loading: profileLoading } = useProfileById(id);
  const resumes = useProfileStore((s) => s.resumes);
  const { requestPublish, confirmModal } = usePublishRequest();
  const searchParams = useSearchParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbPage, setThumbPage] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbScrollRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const draggingRef = useRef(false);
  // 세로로 긴 원고를 내리려고 스크롤했는데 가로 드래그로 오인해 옆 그림으로 넘어가버리는
  // 문제(현직자 피드백) — pointerdown 시점엔 아직 방향을 모르니 캡처를 미루고, 첫 move에서
  // 가로/세로 중 뭐가 더 컸는지 본 뒤에만 가로 스와이프로 확정한다. 세로로 판정되면 이번
  // 제스처 내내 손 떼기 전까지 무시해 브라우저의 기본 세로 스크롤에 그대로 맡긴다.
  const gestureAxisRef = useRef<"x" | "y" | null>(null);
  // 스와이프 힌트: 첫 진입 시 한 번만 표시
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  // 아래 두 state는 "마지막으로 언제 맞췄는지"만 기억한다 — 실제 조정은 렌더 도중
  // 조건부로 한다(React가 권장하는 "렌더링 중 state 조정" 패턴). ref는 렌더 중 읽고 쓰면
  // 안 되는 값이라(react-hooks/refs) 여기선 못 쓰고, 비교용으로만 쓰는 state로 대신한다.
  const [hintTriggeredFor, setHintTriggeredFor] = useState<number | null>(null);

  const ownResume = resumes.find((r) => r.id === id);
  const isOwnResume = ownResume !== undefined;
  const isPublished = ownResume?.isPublished ?? false;
  const bookmarked = useProfileStore((s) => s.bookmarkedIds.includes(id));
  const toggleBookmark = useProfileStore((s) => s.actions.toggleBookmark);

  useEffect(() => {
    if (searchParams.get("print") === "1" && profile) {
      track("pdf_downloaded", { image_count: profile.images.length });
      const timer = setTimeout(() => window.print(), 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, !!profile]);

  // 스와이프 힌트를 켜는 트리거는 렌더 중에 조건부로 판단한다 — 이미지 개수가 바뀐(=새
  // 이력서를 본) 첫 렌더에서만 한 번 켠다. 끄는 쪽(3초 타이머)은 진짜 "구독" 성격이라
  // 그대로 effect에 남긴다.
  if (profile && profile.images.length > 1 && hintTriggeredFor !== profile.images.length) {
    setHintTriggeredFor(profile.images.length);
    setShowSwipeHint(true);
  }
  useEffect(() => {
    if (!showSwipeHint) return;
    const timer = setTimeout(() => setShowSwipeHint(false), 3000);
    return () => clearTimeout(timer);
  }, [showSwipeHint]);

  if (profileLoading) {
    return <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-20" />;
  }

  if (!profile) {
    return (
      <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-20 text-center text-body-sm text-neutral-400">
        이력서를 찾을 수 없어요.
      </div>
    );
  }

  const imageCount = profile.images.length;

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(imageCount - 1, index));
    setActiveIndex(clamped);
    setThumbPage(Math.floor(clamped / THUMBS_PER_PAGE));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // 방향을 아직 모르니 여기서는 포인터를 잡지 않는다 — 세로로 판정되면 브라우저의
    // 기본 스크롤에 그대로 넘겨야 해서, 캡처는 가로로 확정된 뒤(handlePointerMove)에 한다.
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    gestureAxisRef.current = null;
    draggingRef.current = true;
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || imageCount <= 1) return;
    if (gestureAxisRef.current === "y") return; // 세로 스크롤로 확정 — 계속 무시

    const dx = e.clientX - dragStartX.current;
    const dy = e.clientY - dragStartY.current;

    if (gestureAxisRef.current === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return; // 방향을 판단하기엔 아직 너무 작다
      if (Math.abs(dy) > Math.abs(dx)) {
        gestureAxisRef.current = "y";
        return;
      }
      gestureAxisRef.current = "x";
      // 포인터 캡처는 실패해도(예: 이미 놓친 포인터) 드래그 자체는 계속 진행해야 한다.
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // no-op
      }
      setIsDragging(true);
    }

    setDragOffset(dx);
  };
  const resetDragState = () => {
    draggingRef.current = false;
    gestureAxisRef.current = null;
    setDragOffset(0);
    setIsDragging(false);
  };
  const handlePointerCancel = () => resetDragState();
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const axis = gestureAxisRef.current;
    resetDragState();
    if (axis === "y") return; // 세로 스크롤이었다 — 전환도 확대도 하지 않는다

    const moved = e.clientX - dragStartX.current;
    const width = trackRef.current?.offsetWidth || 1;
    const ratio = moved / width;
    if (imageCount > 1 && Math.abs(ratio) > SWIPE_THRESHOLD_RATIO) {
      goTo(activeIndex + (ratio < 0 ? 1 : -1));
    } else if (Math.abs(moved) < 6 && profile.images[activeIndex]) {
      setZoomOpen(true);
    }
  };

  const thumbStart = thumbPage * THUMBS_PER_PAGE;
  const visibleThumbs = profile.images.slice(thumbStart, thumbStart + THUMBS_PER_PAGE);
  const hasPrevThumbPage = thumbPage > 0;
  const hasMoreThumbPages = thumbStart + THUMBS_PER_PAGE < imageCount;
  // mask-image로 스크롤 가능한 쪽의 썸네일을 실제로 옅어지며 사라지게 한다.
  const thumbMaskImage =
    hasPrevThumbPage && hasMoreThumbPages
      ? "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)"
      : hasMoreThumbPages
        ? "linear-gradient(to right, black 88%, transparent 100%)"
        : hasPrevThumbPage
          ? "linear-gradient(to right, transparent 0%, black 12%, black 100%)"
          : undefined;

  // 현재 이미지의 캡션
  const currentCaption = profile.imageCaptions?.[activeIndex] || "";

  return (
    // 모바일 하단 고정 바 높이가 내 이력서(버튼 2개+PDF 링크+안내문, 실측 약 184~198px)냐
    // 남의 이력서(컨택하기+북마크 한 줄, 실측 약 88px)냐에 따라 크게 달라져서, 내 이력서에서는
    // 컨텐츠 하단이 바에 가려졌다 — 케이스별로 여유 있게 띄운다. 데스크톱은 pb-24로 늘려
    // "맨 위로" 버튼이 최하단 안내문과 겹치지 않을 여백을 확보한다.
    <div className={`max-w-[1160px] mx-auto px-5 md:px-10 py-8 ${isOwnResume ? "pb-56" : "pb-24"} md:pb-24`}>
      <div className="grid grid-cols-1 md:grid-cols-[420px_1fr] print:grid-cols-1 gap-12">
        <div className="space-y-4">
          <p className="text-[26px] leading-[1.45] font-bold text-neutral-900 line-clamp-2">{profile.intro}</p>

          {/* 닉네임 / 공개 시기 — 시각 계층 강화.
              AT-1: publishedAt(끌올 시각)이 이제 비공개 전환 후에도 남아있으므로, 남의 프로필(항상
              공개된 것만 조회 가능)과 달리 내 프로필은 현재 비공개 상태면 이 배지를 숨겨야 한다. */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-bold text-neutral-900">{profile.nickname}</span>
            {profile.publishedAt && (!isOwnResume || isPublished) && (
              <span className="text-caption text-neutral-400">{formatRelativeTime(profile.publishedAt)} 공개</span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {profile.parts.map((tag) => (
              <Tag key={tag} variant="part">
                {tag}
              </Tag>
            ))}
            {profile.preferredGenres.map((tag) => (
              <Tag key={tag} variant="genre">
                {tag}
              </Tag>
            ))}
          </div>

          {/* 소개 — whitespace-pre-wrap으로 줄바꿈 보존 */}
          {profile.bio && (
            <p className="text-[15px] leading-[1.75] text-neutral-700 whitespace-pre-wrap">{profile.bio}</p>
          )}

          {isOwnResume ? (
            <div className="hidden md:block print:hidden">
              <ActionButtons
                isOwnResume={isOwnResume}
                isPublished={isPublished}
                id={id}
                onContact={() => setShowContact(true)}
                onTogglePublish={() => requestPublish(id)}
                bookmarked={bookmarked}
                onToggleBookmark={() => toggleBookmark(id)}
              />
            </div>
          ) : (
            // sticky로 고정된 뒤 위아래가 반투명 그라데이션이면 스크롤되는 뒤 텍스트가
            // 버튼 영역 위로 비쳐 보였다 — 불투명 흰 배경 + 충분한 z-index로 완전히 가린다.
            <div className="hidden md:block md:sticky md:top-16 z-20 bg-white print:hidden py-4">
              <ActionButtons
                isOwnResume={isOwnResume}
                isPublished={isPublished}
                id={id}
                onContact={() => setShowContact(true)}
                onTogglePublish={() => requestPublish(id)}
                bookmarked={bookmarked}
                onToggleBookmark={() => toggleBookmark(id)}
              />
            </div>
          )}

          <div className="border-t border-neutral-200 pt-5 space-y-5">
            <InfoRow label="작업 파트" value={profile.parts.join(", ") || "-"} />
            {!profile.isNewcomer && <CareerInfoRow careers={profile.careers} />}
            <GenrePreferenceRows preferred={profile.preferredGenres} disliked={profile.dislikedGenres} />
            <InfoRow label="작업물 성향" value={profile.workStyle} />
            <InfoRow
              label="사용 툴"
              value={
                profile.tools
                  .map((t) => {
                    if (t !== CSP_EDITION_TOOL || !profile.cspEdition) return t;
                    const version = profile.cspVersion ? ` Ver.${profile.cspVersion}` : "";
                    return `${t} ${profile.cspEdition}${version}`;
                  })
                  .join(", ") || "-"
              }
            />
            <ChoiceAndNoteRow label="작가 특징" choices={profile.authorTraits} note={profile.authorTraitsNote} />
            <InfoRow
              label="근무형태"
              value={profile.workTypes.length > 0 ? profile.workTypes.join(" · ") : "-"}
            />
            <ChoiceAndNoteRow
              label="연락 가능 시간대"
              choices={profile.contactTimes}
              note={profile.contactNote}
            />
          </div>
        </div>

        <div className="space-y-4 print:hidden">
          {/* 썸네일 영역 — 가로 드래그/스와이프 + 페이드 힌트 */}
          {imageCount > 1 && (
            <div className="relative">
              <div className="flex items-center gap-2">
                {hasPrevThumbPage && (
                  <button
                    type="button"
                    onClick={() => setThumbPage((p) => p - 1)}
                    aria-label="이전 썸네일"
                    className="shrink-0 w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:border-neutral-400 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}
                <div
                  ref={thumbScrollRef}
                  className="flex gap-2 overflow-x-auto scrollbar-hide min-w-0 w-full scroll-smooth"
                  style={{
                    scrollSnapType: "x mandatory",
                    WebkitOverflowScrolling: "touch",
                    // 흰 박스를 덮어씌우는 대신 썸네일 자체가 옅어지며 사라지게 한다 — "더 있다"는
                    // 게 그림으로 직접 느껴져서 위에 올려둔 흰 그라데이션보다 자연스럽다.
                    WebkitMaskImage: thumbMaskImage,
                    maskImage: thumbMaskImage,
                  }}
                >
                  {visibleThumbs.map((src, i) => {
                    const idx = thumbStart + i;
                    return (
                      <button
                        key={`${src}-${idx}`}
                        type="button"
                        onClick={() => goTo(idx)}
                        // flex-1로 폭을 나눠 가지면 5장 미만일 때 남는 공간을 서로 나눠 커져버린다.
                        // 5장이 꽉 찼을 때 나오는 크기(전체 폭에서 gap 4개를 뺀 값의 1/5)로 고정해
                        // 장수와 무관하게 항상 같은 크기를 유지하고, 남는 자리는 왼쪽 정렬로 비워둔다.
                        style={{ scrollSnapAlign: "start", width: "calc((100% - 32px) / 5)" }}
                        className={`shrink-0 aspect-square rounded-sm overflow-hidden border-2 transition-colors duration-[.18s] ${
                          idx === activeIndex
                            ? "border-neutral-900 opacity-100"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`썸네일 ${idx + 1}`}
                          className="w-full h-full object-cover object-top"
                          draggable={false}
                        />
                      </button>
                    );
                  })}
                </div>
                {hasMoreThumbPages && (
                  <button
                    type="button"
                    onClick={() => setThumbPage((p) => p + 1)}
                    aria-label="다음 썸네일"
                    className="ml-auto shrink-0 w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:border-neutral-400 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 메인 이미지 캐러셀 */}
          <div className="relative">
            {/* 좌우 화살표 버튼 — 드래그/스와이프가 세로 스크롤과 헷갈릴 수 있어(현직자 피드백)
                오작동 없이 확실하게 넘길 수 있는 수단을 별도로 둔다. 세로로 긴 원고는 버튼을
                이미지 세로 중앙(absolute)에 고정하면 스크롤해서 내려간 동안 화면 밖으로
                나가버려 있는지도 몰랐다 — sticky + 뷰포트 50%로 바꿔 스크롤을 따라다니게
                하되, 이 컨테이너(이미지+캡션+점) 범위를 벗어나면 자연히 멈춘다. 이 블록을
                이미지(trackRef)보다 먼저 두는 게 중요하다 — sticky는 자기 "제자리"(문서 흐름
                상 위치)에서부터 그 자리를 지나 스크롤할 때 들러붙는데, 이미지 뒤에 두면
                제자리가 이미지 맨 아래라 다 내려야만 나타난다. */}
            {imageCount > 1 && (
              <div className="sticky z-20 h-0 pointer-events-none" style={{ top: "50vh" }}>
                <div className="flex items-center justify-between px-2 -translate-y-1/2">
                  <div>
                    {activeIndex > 0 && (
                      <button
                        type="button"
                        onClick={() => goTo(activeIndex - 1)}
                        aria-label="이전 그림"
                        className="pointer-events-auto w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors hover:bg-black/70"
                      >
                        <ChevronLeft size={18} />
                      </button>
                    )}
                  </div>
                  <div>
                    {activeIndex < imageCount - 1 && (
                      <button
                        type="button"
                        onClick={() => goTo(activeIndex + 1)}
                        aria-label="다음 그림"
                        className="pointer-events-auto w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors hover:bg-black/70"
                      >
                        <ChevronRight size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div
              ref={trackRef}
              className="relative w-full rounded-lg overflow-hidden select-none cursor-zoom-in"
              style={{ touchAction: "pan-y" }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={handlePointerCancel}
            >
              {/* 보이지 않는 사이저 — naturalWidth/Height를 읽어 폭에 곱하는 계산 대신, 브라우저가
                  실제로 그린 지금 이미지의 높이를 그대로 컨테이너 높이로 삼는다. 이미지 로드
                  타이밍(캐시된 이미지의 onLoad 누락 등)에 좌우되지 않아 "짧은 그림 아래에
                  큰 이미지 기준 여백이 남는" 부류의 버그가 구조적으로 나지 않는다. 다만
                  height:auto라 예전처럼 높이가 부드럽게 애니메이션되진 않는다 — 정확성과
                  맞바꿨다. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.images[activeIndex]}
                alt=""
                aria-hidden="true"
                className="w-full h-auto invisible block"
              />
              <div
                className="absolute inset-0 flex items-start"
                style={{
                  transform: `translateX(calc(${-activeIndex * 100}% + ${dragOffset}px))`,
                  transition: isDragging ? "none" : SLIDE_TRANSITION,
                }}
              >
                {profile.images.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${src}-${i}`}
                    src={src}
                    alt={`${profile.nickname} 대표작 ${i + 1}`}
                    className="w-full h-auto block shrink-0"
                    draggable={false}
                  />
                ))}
              </div>

              {/* 이미지 카운터 */}
              {imageCount > 1 && (
                <div className="absolute top-3 right-3 bg-black/60 text-white text-caption font-semibold px-2.5 py-1 rounded-pill backdrop-blur-sm">
                  {activeIndex + 1} / {imageCount}
                </div>
              )}

              {/* 스와이프 힌트 애니메이션 */}
              {showSwipeHint && imageCount > 1 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-pulse">
                  <div className="flex items-center gap-2 bg-black/50 text-white text-body-sm px-4 py-2 rounded-pill backdrop-blur-sm">
                    <ChevronLeft size={16} />
                    좌우로 넘겨보세요
                    <ChevronRight size={16} />
                  </div>
                </div>
              )}
            </div>

            {/* 이미지 캡션 바 (하단) */}
            {currentCaption && (
              <div className="mt-2 px-3 py-2 bg-neutral-100 rounded-md">
                <p className="text-[13px] text-neutral-600 font-medium">{currentCaption}</p>
              </div>
            )}

            {/* 도트 인디케이터 */}
            {imageCount > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {profile.images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goTo(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === activeIndex ? "bg-neutral-900" : "bg-neutral-300"
                    }`}
                    aria-label={`이미지 ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PDF 출력 전용 — coverIndex는 카드용 썸네일 전용 개념이라 여기선 안 쓴다.
            사용자가 설정해둔 순서 그대로: 첫 번째 그림을 크게, 나머지는 2열로. */}
        <div className="hidden print:block space-y-4">
          {profile.images[0] && (
            <div className="break-inside-avoid">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile.images[0]} alt={`${profile.nickname} 대표작`} className="w-full h-auto" />
            </div>
          )}
          {profile.images.length > 1 && (
            <div className="grid grid-cols-2 gap-4">
              {profile.images
                .map((src, i) => ({ src, i }))
                .filter(({ i }) => i !== 0)
                .map(({ src, i }) => (
                  <div key={src} className="break-inside-avoid">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`${profile.nickname} 그림 ${i + 1}`} className="w-full h-auto" />
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* AQ-3: 신고 안내 — 비-내 이력서, 인쇄 제외. 기존 의견 보내기 채널(AN-2) 겸용. */}
      {!isOwnResume && (
        <p className="print:hidden text-caption text-neutral-400 text-center mt-4 pb-6">
          부적절한 콘텐츠인가요?{" "}
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSdSwJGKrL3EPtypo_AZP2QOpiycC9Lx_G6bFC74jFiDWcfIBg/viewform?usp=header"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            의견 보내기
          </a>
          로 알려주세요.
        </p>
      )}

      {showContact && <ContactModal email={profile.email} onClose={() => setShowContact(false)} />}
      {confirmModal}

      {zoomOpen && profile.images[activeIndex] && (
        <ImageZoom
          src={profile.images[activeIndex]}
          alt={`${profile.nickname} 대표작 ${activeIndex + 1}`}
          onClose={() => setZoomOpen(false)}
        />
      )}

      {/* 모바일 하단 고정 바 */}
      <div
        className="md:hidden print:hidden fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-white from-70% to-transparent px-5 pt-8"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <ActionButtons
          isOwnResume={isOwnResume}
          isPublished={isPublished}
          id={id}
          onContact={() => setShowContact(true)}
          onTogglePublish={() => requestPublish(id)}
          bookmarked={bookmarked}
          onToggleBookmark={() => toggleBookmark(id)}
        />
      </div>

      {/* 맨 위로 스크롤 버튼 */}
      <ScrollToTopButton />
    </div>
  );
}

export default function ProfileDetail({ id }: { id: string }) {
  return (
    <Suspense fallback={null}>
      <ProfileDetailInner id={id} />
    </Suspense>
  );
}
