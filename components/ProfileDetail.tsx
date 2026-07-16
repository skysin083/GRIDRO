"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useProfileById } from "@/lib/getProfileById";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { useProfileStore } from "@/store/useProfileStore";
import { usePublishRequest } from "@/lib/usePublishRequest";
import { CSP_EDITION_TOOL } from "@/lib/constants";
import { CareerEntry } from "@/types/profile";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import ContactModal from "@/components/ContactModal";

const THUMBS_PER_PAGE = 5;
const SWIPE_THRESHOLD_RATIO = 0.15;
const SLIDE_TRANSITION = "transform .25s cubic-bezier(.22,.61,.36,1)";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-caption font-bold text-neutral-400 tracking-[.04em] mb-1">{label}</p>
      <p className="text-[15px] leading-[1.6] text-neutral-800">{value}</p>
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
        {careers.map((c) => {
          const platformLabel = c.platform === "기타" ? c.platformCustom : c.platform;
          return (
          <div key={c.id}>
            <p className="text-[15px] leading-[1.6] text-neutral-800">
              {[c.title, platformLabel, formatPeriod(c)].filter(Boolean).join(" · ")}
            </p>
            {c.memo && <p className="text-[13px] text-neutral-500">{c.memo}</p>}
            {/* 링크는 입력만 받고 상세에서 렌더되지 않아, 적어도 보이지 않았다.
                작품 링크는 구인자가 실제로 눌러보는 정보라 새 탭으로 연다. */}
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

// AN-4: 컨택하기(방문자) / 공개 전환+수정하기+PDF로 저장(본인 이력서) 액션 블록 — 데스크톱 sticky와
// 모바일 하단 고정 바 양쪽에서 동일하게 재사용해 두 위치의 동작이 어긋나지 않게 한다.
function ActionButtons({
  isOwnResume,
  isPublished,
  id,
  onContact,
  onTogglePublish,
  stackClassName = "",
}: {
  isOwnResume: boolean;
  isPublished: boolean;
  id: string;
  onContact: () => void;
  onTogglePublish: () => void;
  stackClassName?: string;
}) {
  if (isOwnResume) {
    return (
      <div className={`flex flex-col gap-2 ${stackClassName}`}>
        {/* 상세까지 와서 다시 '내 이력서'로 돌아가야 공개 전환이 가능했다. 여기서 바로 끝내게 한다. */}
        <Button
          variant={isPublished ? "outline" : "dark-pill"}
          className="w-full"
          onClick={onTogglePublish}
        >
          {isPublished ? "비공개로 전환" : "구직란에 올리기"}
        </Button>
        <Button variant="outline" className="w-full" href={`/write?id=${id}`}>
          수정하기
        </Button>
        <Button variant="outline" className="w-full" href={`/profile/${id}?print=1`}>
          PDF로 저장
        </Button>
      </div>
    );
  }
  return (
    <Button variant="dark-pill" className={`w-full ${stackClassName}`} onClick={onContact}>
      컨택하기
    </Button>
  );
}

function ProfileDetailInner({ id }: { id: string }) {
  const profile = useProfileById(id);
  const resumes = useProfileStore((s) => s.resumes);
  // AK-2: 공개 규칙은 '내 이력서'와 같은 훅에서 온다 — 두 진입점의 동작이 갈라지지 않게.
  const { requestPublish, confirmModal } = usePublishRequest();
  const searchParams = useSearchParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbPage, setThumbPage] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  // AP-1: 메인 이미지는 그림마다 원본 비율대로 높이가 달라져야 한다. 슬라이드 트랙은
  // 모든 이미지를 나란히 한 줄에 두는 구조라 트랙 자체의 높이는 항상 "가장 큰 그림" 기준으로
  // 잡히므로, 바깥 래퍼 높이를 현재 보이는 그림의 실제 비율로 직접 계산해 덮어씌운다.
  const [naturalRatios, setNaturalRatios] = useState<Record<number, number>>({});
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);

  useEffect(() => {
    const updateWidth = () => setTrackWidth(trackRef.current?.offsetWidth || 0);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const ownResume = resumes.find((r) => r.id === id);
  const isOwnResume = ownResume !== undefined;

  useEffect(() => {
    if (searchParams.get("print") === "1") {
      const timer = setTimeout(() => window.print(), 300);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!profile) {
    return (
      <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-20 text-center text-body-sm text-neutral-400">
        이력서를 찾을 수 없어요.
      </div>
    );
  }

  const imageCount = profile.images.length;

  // AN-2: 드래그·스와이프·썸네일 클릭 모두 이 함수로 수렴 — activeIndex와 썸네일 페이지가
  // 항상 같이 움직여, 드래그로 현재 썸네일 페이지 밖의 그림으로 넘어가도 다음 렌더에서
  // 해당 썸네일 페이지가 자동으로 따라온다.
  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(imageCount - 1, index));
    setActiveIndex(clamped);
    setThumbPage(Math.floor(clamped / THUMBS_PER_PAGE));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartX.current = e.clientX;
    setIsDragging(true);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setDragOffset(e.clientX - dragStartX.current);
  };
  const endDrag = () => {
    if (!isDragging) return;
    const width = trackRef.current?.offsetWidth || 1;
    const ratio = dragOffset / width;
    if (Math.abs(ratio) > SWIPE_THRESHOLD_RATIO) {
      goTo(activeIndex + (ratio < 0 ? 1 : -1));
    }
    setDragOffset(0);
    setIsDragging(false);
  };

  // AP-1: 로컬/캐시된 이미지는 React가 onLoad 리스너를 붙이기 전에 이미 로드가 끝나 있어
  // onLoad가 아예 안 붙는 경우가 있다 — ref 콜백에서 img.complete를 동기적으로 한 번 더
  // 확인해 그 경우도 놓치지 않는다. 값이 같으면 이전 state를 그대로 반환해 불필요한
  // 리렌더/무한루프를 막는다.
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

  return (
    <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-8 pb-24 md:pb-8">
      <div className="grid grid-cols-1 md:grid-cols-[420px_1fr] print:grid-cols-1 gap-12">
        <div className="space-y-4">
          <p className="text-[26px] leading-[1.45] font-bold text-neutral-900 line-clamp-2">{profile.intro}</p>
          <p className="text-[15px] font-semibold text-neutral-500">
            {profile.nickname}
            {profile.publishedAt && ` · ${formatRelativeTime(profile.publishedAt)} 공개`}
          </p>

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

          {profile.bio && <p className="text-[15px] leading-[1.75] text-neutral-700">{profile.bio}</p>}

          {/* AN-4: 컬럼 전체가 아니라 이 액션 버튼 블록만 sticky — 정보량이 뷰포트보다 길어져도
              아래 정보 항목이 sticky 블록에 가려 못 보이는 문제(스크롤 충돌)를 피한다. */}
          <div className="hidden md:block md:sticky md:top-[88px] print:hidden">
            <ActionButtons
              isOwnResume={isOwnResume}
              isPublished={ownResume?.isPublished ?? false}
              id={id}
              onContact={() => setShowContact(true)}
              onTogglePublish={() => requestPublish(id)}
            />
          </div>

          <div className="border-t border-neutral-200 pt-5 space-y-5">
            <InfoRow label="작업 파트" value={profile.parts.join(", ") || "-"} />
            {!profile.isNewcomer && <CareerInfoRow careers={profile.careers} />}
            <InfoRow
              label="선호·불호 장르"
              value={`${profile.preferredGenres.join(", ") || "-"} / 불호: ${profile.dislikedGenres.join(", ") || "-"}`}
            />
            <InfoRow label="작업물 성향" value={profile.workStyle} />
            <InfoRow
              label="사용 툴"
              // 클튜는 에디션까지 붙여 보여준다 — 에디션에 따라 되는 작업이 갈리는 걸 구인자가 본다.
              value={
                profile.tools
                  .map((t) =>
                    t === CSP_EDITION_TOOL && profile.cspEdition ? `${t} ${profile.cspEdition}` : t
                  )
                  .join(", ") || "-"
              }
            />
            <InfoRow
              label="작가 특징"
              value={[...profile.authorTraits, profile.authorTraitsNote].filter(Boolean).join(", ") || "-"}
            />
            <InfoRow
              label="근무형태"
              value={profile.workTypes.length > 0 ? profile.workTypes.join(" · ") : "-"}
            />
            <InfoRow
              label="연락 가능 시간대"
              value={profile.contactNote || (profile.contactTimes.length > 0 ? profile.contactTimes.join(" · ") : "-")}
            />
          </div>
        </div>

        <div className="space-y-4 print:hidden">
          {imageCount > 1 && (
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
              <div className="flex gap-2 overflow-x-auto scrollbar-hide min-w-0">
                {visibleThumbs.map((src, i) => {
                  const idx = thumbStart + i;
                  return (
                    <button
                      key={`${src}-${idx}`}
                      type="button"
                      onClick={() => goTo(idx)}
                      className={`w-24 h-24 shrink-0 rounded-sm overflow-hidden border-2 transition-colors duration-[.18s] ${
                        idx === activeIndex ? "border-neutral-900 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`썸네일 ${idx + 1}`} className="w-full h-full object-cover object-top" draggable={false} />
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
          )}

          {/* AN-2: 좌우 화살표 캐러셀 제거 — 대신 포인터(마우스 드래그/터치 스와이프)로 넘긴다.
              썸네일 클릭도 같은 activeIndex/translateX 상태를 움직이므로 전환 애니메이션이 동일하다.
              AP-1: 컨테이너에 고정 height/aspect-ratio를 주지 않는다 — 현재 그림의 실측 비율로
              계산한 높이(trackHeight)만 적용해 그림마다 세로 길이가 다르게 흐르게 한다. 좌우
              여백이 없으므로 배경색도 더 이상 필요 없다. */}
          <div
            ref={trackRef}
            className="relative w-full rounded-lg overflow-hidden select-none"
            style={{ height: trackHeight, touchAction: "pan-y", transition: isDragging ? "none" : "height .25s cubic-bezier(.22,.61,.36,1)" }}
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
          </div>
        </div>

        {/* AE-3: PDF 출력 전용 — 업로드한 그림 전체를 순서대로 포함 (대표는 크게, 나머지는 2열) */}
        <div className="hidden print:block space-y-4">
          {profile.images[0] && (
            <div className="break-inside-avoid">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile.images[0]} alt={`${profile.nickname} 대표작 1`} className="w-full h-auto" />
            </div>
          )}
          {profile.images.length > 1 && (
            <div className="grid grid-cols-2 gap-4">
              {profile.images.slice(1).map((src, i) => (
                <div key={src} className="break-inside-avoid">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`${profile.nickname} 대표작 ${i + 2}`} className="w-full h-auto" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showContact && <ContactModal email={profile.email} onClose={() => setShowContact(false)} />}
      {confirmModal}

      {/* AO-1: 하단 고정 탭바(AM-1)가 사라져 이 버튼 바가 모바일의 유일한 화면 하단 고정
          요소가 됐다 — 세이프에어리어 패딩도 이제 여기서 처리한다. */}
      {/* 경계선으로 자르는 대신 위쪽을 흰색으로 흘려보낸다 — 바를 구분선으로 못 박지 않으면서
          버튼 뒤로 지나가는 내용이 비쳐 읽기 어려워지는 것만 막는다. 배경 자체를 빼면 글자가 겹친다. */}
      <div
        className="md:hidden print:hidden fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-white from-70% to-transparent px-5 pt-8"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <ActionButtons
          isOwnResume={isOwnResume}
          isPublished={ownResume?.isPublished ?? false}
          id={id}
          onContact={() => setShowContact(true)}
          onTogglePublish={() => requestPublish(id)}
        />
      </div>
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
