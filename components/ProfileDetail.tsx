"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProfileById } from "@/lib/getProfileById";
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

export default function ProfileDetail({ id }: { id: string }) {
  const profile = useProfileById(id);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showContact, setShowContact] = useState(false);

  if (!profile) {
    return (
      <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-20 text-center text-body-sm text-neutral-400">
        프로필을 찾을 수 없어요.
      </div>
    );
  }

  const goPrev = () => setActiveIndex((i) => (i === 0 ? profile.images.length - 1 : i - 1));
  const goNext = () => setActiveIndex((i) => (i === profile.images.length - 1 ? 0 : i + 1));

  return (
    <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-8">
      <div className="grid md:grid-cols-[380px_1fr] gap-12">
        <div className="md:sticky md:top-[88px] h-fit space-y-4">
          <h2 className="text-h2 font-bold text-neutral-900">{profile.nickname}</h2>
          <p className="text-[16px] leading-[1.7] text-neutral-500">{profile.intro}</p>

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

          <Button variant="dark-pill" className="w-full" onClick={() => setShowContact(true)}>
            컨택하기
          </Button>

          <div className="border-t border-neutral-200 pt-5 space-y-5">
            <InfoRow label="작업 파트" value={profile.parts.join(", ") || "-"} />
            <InfoRow
              label="선호·불호 장르"
              value={`${profile.preferredGenres.join(", ") || "-"} / 불호: ${profile.dislikedGenres.join(", ") || "-"}`}
            />
            <InfoRow label="작업물 성향" value={profile.workStyle} />
            <InfoRow
              label="사용 툴"
              value={profile.tools.map((t) => `${t.name}(${t.level})`).join(", ") || "-"}
            />
            <InfoRow
              label="작가 특징"
              value={[...profile.authorTraits, profile.authorTraitsNote].filter(Boolean).join(", ") || "-"}
            />
            <InfoRow label="근무형태" value={profile.workType || "-"} />
            <InfoRow
              label="연락 가능 시간대"
              value={[profile.contactTime, profile.contactNote].filter(Boolean).join(" · ") || "-"}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative w-full rounded-lg overflow-hidden bg-neutral-100 flex items-center justify-center" style={{ maxHeight: "70vh" }}>
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                >
                  <ChevronLeft size={18} className="text-neutral-700" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="다음 그림"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                >
                  <ChevronRight size={18} className="text-neutral-700" />
                </button>
              </>
            )}
          </div>

          {profile.images.length > 1 && (
            <div className="flex gap-2">
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
      </div>

      {showContact && <ContactModal email={profile.email} onClose={() => setShowContact(false)} />}
    </div>
  );
}
