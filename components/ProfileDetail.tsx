"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProfileById } from "@/lib/getProfileById";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { useProfileStore } from "@/store/useProfileStore";
import { CareerEntry } from "@/types/profile";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import ContactModal from "@/components/ContactModal";

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
          </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileDetailInner({ id }: { id: string }) {
  const profile = useProfileById(id);
  const resumes = useProfileStore((s) => s.resumes);
  const searchParams = useSearchParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showContact, setShowContact] = useState(false);

  const isOwnResume = resumes.some((r) => r.id === id);

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

  const goPrev = () => setActiveIndex((i) => (i === 0 ? profile.images.length - 1 : i - 1));
  const goNext = () => setActiveIndex((i) => (i === profile.images.length - 1 ? 0 : i + 1));

  return (
    <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-8">
      <div className="grid md:grid-cols-[380px_1fr] print:grid-cols-1 gap-12">
        <div className="md:sticky md:top-[88px] print:static h-fit space-y-4">
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

          {isOwnResume ? (
            <div className="flex flex-col gap-2 print:hidden">
              <Button variant="dark-pill" className="w-full" href={`/write?id=${id}`}>
                수정하기
              </Button>
              <Button variant="outline" className="w-full" href={`/profile/${id}?print=1`}>
                PDF로 저장
              </Button>
            </div>
          ) : (
            <Button variant="dark-pill" className="w-full print:hidden" onClick={() => setShowContact(true)}>
              컨택하기
            </Button>
          )}

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
              value={profile.tools.join(", ") || "-"}
            />
            <InfoRow
              label="작가 특징"
              value={[...profile.authorTraits, profile.authorTraitsNote].filter(Boolean).join(", ") || "-"}
            />
            <InfoRow label="근무형태" value={profile.workType || "-"} />
            <InfoRow label="연락 가능 시간대" value={profile.contactNote || profile.contactTime || "-"} />
          </div>
        </div>

        <div className="space-y-3 print:hidden">
          <div
            className="relative w-full rounded-lg overflow-hidden bg-neutral-100 flex items-center justify-center"
            style={{ maxHeight: "70vh" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.images[activeIndex]}
              alt={`${profile.nickname} 대표작 ${activeIndex + 1}`}
              className="w-full h-auto object-contain"
              style={{ maxHeight: "70vh" }}
            />

            {profile.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="이전 그림"
                  className="print:hidden absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                >
                  <ChevronLeft size={18} className="text-neutral-700" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="다음 그림"
                  className="print:hidden absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                >
                  <ChevronRight size={18} className="text-neutral-700" />
                </button>
              </>
            )}
          </div>

          {profile.images.length > 1 && (
            <div className="print:hidden flex gap-2">
              {profile.images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={`w-16 h-20 rounded-sm overflow-hidden border-2 transition-all duration-[.18s] ${
                    i === activeIndex ? "border-neutral-900 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`썸네일 ${i + 1}`} className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>
          )}
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
