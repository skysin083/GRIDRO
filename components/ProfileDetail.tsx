"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  Briefcase,
  Heart,
  Ban,
  Palette,
  Wrench,
  Star,
  Building2,
  Clock,
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

// --- 아이콘 달린 정보 행 ---
function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-caption font-bold text-neutral-400 tracking-[.04em] mb-1">
        {Icon && <Icon size={13} className="text-neutral-400" />}
        {label}
      </p>
      <p className="text-[15px] leading-[1.6] text-neutral-800">{value}</p>
    </div>
  );
}

// --- 선호·불호 장르 분리 표시 ---
function GenrePreferenceRows({ preferred, disliked }: { preferred: string[]; disliked: string[] }) {
  return (
    <>
      <div>
        <p className="flex items-center gap-1.5 text-caption font-bold text-neutral-400 tracking-[.04em] mb-1.5">
          <Heart size={13} className="text-primary-500" />
          선호 장르
        </p>
        <div className="flex flex-wrap gap-1.5">
          {preferred.length > 0 ? (
            preferred.map((g) => (
              <span
                key={g}
                className="inline-block text-caption px-2 py-0.5 rounded-sm bg-primary-50 text-primary-700 font-medium"
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
          <p className="flex items-center gap-1.5 text-caption font-bold text-neutral-400 tracking-[.04em] mb-1.5">
            <Ban size={13} className="text-danger" />
            불호 장르
          </p>
          <div className="flex flex-wrap gap-1.5">
            {disliked.map((g) => (
              <span
                key={g}
                className="inline-block text-caption px-2 py-0.5 rounded-sm bg-red-50 text-red-600 font-medium"
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

// --- 작가 특징 분리 표시 (태그 + 자유입력) ---
function AuthorTraitsRow({ traits, note }: { traits: string[]; note: string }) {
  if (traits.length === 0 && !note) return null;
  return (
    <div>
      <p className="flex items-center gap-1.5 text-caption font-bold text-neutral-400 tracking-[.04em] mb-1.5">
        <Star size={13} className="text-neutral-400" />
        작가 특징
      </p>
      {traits.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {traits.map((t) => (
            <Tag key={t} variant="part">
              {t}
            </Tag>
          ))}
        </div>
      )}
      {note && <p className="text-[15px] leading-[1.6] text-neutral-700">{note}</p>}
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
      <p className="flex items-center gap-1.5 text-caption font-bold text-neutral-400 tracking-[.04em] mb-1">
        <Briefcase size={13} className="text-neutral-400" />
        경력
      </p>
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
      className="fixed bottom-20 md:bottom-8 right-5 z-30 w-11 h-11 rounded-full bg-neutral-900/80 text-white flex items-center justify-center shadow-lg backdrop-blur-sm transition-all duration-[.25s] hover:bg-neutral-900 hover:scale-110 print:hidden"
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
  const [naturalRatios, setNaturalRatios] = useState<Record<number, number>>({});
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbScrollRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const draggingRef = useRef(false);
  // 스와이프 힌트: 첫 진입 시 한 번만 표시
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  // 아래 두 state는 "마지막으로 언제 맞췄는지"만 기억한다 — 실제 조정은 렌더 도중
  // 조건부로 한다(React가 권장하는 "렌더링 중 state 조정" 패턴). ref는 렌더 중 읽고 쓰면
  // 안 되는 값이라(react-hooks/refs) 여기선 못 쓰고, 비교용으로만 쓰는 state로 대신한다.
  const [hintTriggeredFor, setHintTriggeredFor] = useState<number | null>(null);
  const [coverSyncedFor, setCoverSyncedFor] = useState<string | null>(null);

  useEffect(() => {
    const updateWidth = () => setTrackWidth(trackRef.current?.offsetWidth || 0);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

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

  // 대표(coverIndex)로 지정한 이미지부터 보여준다 — profile은 비동기로 도착하므로
  // useState(0) 초기값에는 못 담고, 로드된 뒤 렌더 중에 한 번만 맞춰준다.
  if (profile && coverSyncedFor !== profile.id) {
    setCoverSyncedFor(profile.id);
    const cover = profile.coverIndex ?? 0;
    setActiveIndex(cover);
    setThumbPage(Math.floor(cover / THUMBS_PER_PAGE));
  }

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
  const coverIdx = profile.coverIndex ?? 0;

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(imageCount - 1, index));
    setActiveIndex(clamped);
    setThumbPage(Math.floor(clamped / THUMBS_PER_PAGE));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartX.current = e.clientX;
    draggingRef.current = true;
    setIsDragging(true);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || imageCount <= 1) return;
    setDragOffset(e.clientX - dragStartX.current);
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const moved = e.clientX - dragStartX.current;
    const width = trackRef.current?.offsetWidth || 1;
    const ratio = moved / width;
    if (imageCount > 1 && Math.abs(ratio) > SWIPE_THRESHOLD_RATIO) {
      goTo(activeIndex + (ratio < 0 ? 1 : -1));
    } else if (Math.abs(moved) < 6 && profile.images[activeIndex]) {
      setZoomOpen(true);
    }
    setDragOffset(0);
    setIsDragging(false);
  };

  const registerNaturalRatio = (index: number, img: HTMLImageElement | null) => {
    if (!img || !img.complete || !img.naturalWidth) return;
    const ratio = img.naturalHeight / img.naturalWidth;
    setNaturalRatios((prev) => (prev[index] === ratio ? prev : { ...prev, [index]: ratio }));
  };

  const activeRatio = naturalRatios[activeIndex];
  const trackHeight = activeRatio && trackWidth ? trackWidth * activeRatio : undefined;

  const thumbStart = thumbPage * THUMBS_PER_PAGE;
  const visibleThumbs = profile.images.slice(thumbStart, thumbStart + THUMBS_PER_PAGE);
  const hasPrevThumbPage = thumbPage > 0;
  const hasMoreThumbPages = thumbStart + THUMBS_PER_PAGE < imageCount;

  // 현재 이미지의 캡션
  const currentCaption = profile.imageCaptions?.[activeIndex] || "";

  return (
    <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-8 pb-24 md:pb-8">
      <div className="grid grid-cols-1 md:grid-cols-[420px_1fr] print:grid-cols-1 gap-12">
        <div className="space-y-4">
          <p className="text-[26px] leading-[1.45] font-bold text-neutral-900 line-clamp-2">{profile.intro}</p>

          {/* 닉네임 / 공개 시기 — 시각 계층 강화 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-bold text-neutral-900">{profile.nickname}</span>
            {profile.publishedAt && (
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
            <div
              className="hidden md:block md:sticky md:top-16 z-10 print:hidden py-4"
              style={{ background: "linear-gradient(180deg, transparent 0%, #fff 16%, #fff 84%, transparent 100%)" }}
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
          )}

          <div className="border-t border-neutral-200 pt-5 space-y-5">
            <InfoRow icon={Layers} label="작업 파트" value={profile.parts.join(", ") || "-"} />
            {!profile.isNewcomer && <CareerInfoRow careers={profile.careers} />}
            <GenrePreferenceRows preferred={profile.preferredGenres} disliked={profile.dislikedGenres} />
            <InfoRow icon={Palette} label="작업물 성향" value={profile.workStyle} />
            <InfoRow
              icon={Wrench}
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
            <AuthorTraitsRow traits={profile.authorTraits} note={profile.authorTraitsNote} />
            <InfoRow
              icon={Building2}
              label="근무형태"
              value={profile.workTypes.length > 0 ? profile.workTypes.join(" · ") : "-"}
            />
            <InfoRow
              icon={Clock}
              label="연락 가능 시간대"
              value={profile.contactNote || (profile.contactTimes.length > 0 ? profile.contactTimes.join(" · ") : "-")}
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
                  className="flex gap-2 overflow-x-auto scrollbar-hide min-w-0 scroll-smooth"
                  style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
                >
                  {visibleThumbs.map((src, i) => {
                    const idx = thumbStart + i;
                    return (
                      <button
                        key={`${src}-${idx}`}
                        type="button"
                        onClick={() => goTo(idx)}
                        style={{ scrollSnapAlign: "start" }}
                        className={`w-24 h-24 shrink-0 rounded-sm overflow-hidden border-2 transition-colors duration-[.18s] ${
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
              {/* 좌우 페이드 힌트 */}
              {hasMoreThumbPages && (
                <div className="pointer-events-none absolute right-8 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent" />
              )}
              {hasPrevThumbPage && (
                <div className="pointer-events-none absolute left-8 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent" />
              )}
            </div>
          )}

          {/* 메인 이미지 캐러셀 */}
          <div className="relative">
            <div
              ref={trackRef}
              className="relative w-full rounded-lg overflow-hidden select-none cursor-zoom-in"
              style={{
                height: trackHeight,
                touchAction: "pan-y",
                transition: isDragging ? "none" : "height .25s cubic-bezier(.22,.61,.36,1)",
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <div
                className="flex items-start"
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
                    ref={(el) => registerNaturalRatio(i, el)}
                    onLoad={(e) => registerNaturalRatio(i, e.currentTarget)}
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

        {/* PDF 출력 전용 — 대표(coverIndex)로 지정한 그림을 크게, 나머지는 2열로 */}
        <div className="hidden print:block space-y-4">
          {profile.images[coverIdx] && (
            <div className="break-inside-avoid">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile.images[coverIdx]} alt={`${profile.nickname} 대표작`} className="w-full h-auto" />
            </div>
          )}
          {profile.images.length > 1 && (
            <div className="grid grid-cols-2 gap-4">
              {profile.images
                .map((src, i) => ({ src, i }))
                .filter(({ i }) => i !== coverIdx)
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
