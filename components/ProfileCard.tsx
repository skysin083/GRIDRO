"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Profile } from "@/types/profile";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { useProfileStore } from "@/store/useProfileStore";
import { track } from "@/lib/mixpanel";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";

export default function ProfileCard({ profile, position }: { profile: Profile; position: number }) {
  // 컴포넌트 로컬 state였던 걸 스토어로 옮겼다 — 새로고침/페이지 이동에도 유지되고,
  // 마이페이지의 "북마크한 작가" 섹션이 이 값을 그대로 읽는다.
  const bookmarked = useProfileStore((s) => s.bookmarkedIds.includes(profile.id));
  const toggleBookmark = useProfileStore((s) => s.actions.toggleBookmark);
  // 공개 중인 내 이력서는 구직란에도 카드로 뜬다 — 내가 쓴 글을 내가 북마크하는 건
  // 의미가 없으니(마이페이지에도 "내 이력서" 섹션이 이미 따로 있다), 버튼 자체를 숨긴다.
  const isOwn = useProfileStore((s) => s.resumes.some((r) => r.id === profile.id));
  const topParts = profile.parts.slice(0, 2);
  const topGenres = profile.preferredGenres.slice(0, 2);

  return (
    <Card hover="subtle" className="group">
      <Link
        href={`/profile/${profile.id}`}
        className="block"
        onClick={() => track("card_clicked", { position, has_career: profile.careers.length > 0 })}
      >
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-neutral-100">
          {profile.images[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.images[0]}
              alt={`${profile.nickname} 대표 그림`}
              className="w-full h-full object-cover object-top"
            />
          )}
          {/* 흰 원형 배경 대신 상단에 옅은 검정 그라데이션을 깔아 아이콘 대비를 만든다.
              배경 없이 라인만 두면 밝은 그림 위에서 아이콘이 사라진다(이력서 카드 ⋯가 겪은 문제와 같다).
              페이드 구간이 짧으면 그라데이션 끝이 띠처럼 보이므로, 같은 농도를 길게 깔아 경계를 지운다. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/30 via-black/10 to-transparent" />
          {!isOwn && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                track(bookmarked ? "bookmark_removed" : "bookmark_added", {
                  source: "feed",
                  profile_id: profile.id,
                });
                toggleBookmark(profile.id);
              }}
              aria-label="북마크"
              aria-pressed={bookmarked}
              className="absolute top-2 right-2 w-9 h-9 flex items-center justify-center transition-transform duration-[.18s] hover:scale-110"
            >
              <Bookmark
                size={20}
                strokeWidth={1.75}
                className={`drop-shadow-[0_1px_2px_rgba(0,0,0,.35)] ${
                  bookmarked ? "fill-white text-white" : "fill-transparent text-white"
                }`}
              />
            </button>
          )}
        </div>
        <div className="p-3 space-y-1.5">
          <p className="text-[17px] font-semibold text-neutral-900 line-clamp-2 leading-snug">{profile.intro}</p>
          <p className="text-[13px] font-medium text-neutral-400">
            {profile.nickname}
            {profile.publishedAt && ` · ${formatRelativeTime(profile.publishedAt)}`}
            {profile.careers.length > 0 && ` · 경력 ${profile.careers.length}작품`}
          </p>
          <div className="flex flex-wrap gap-1 pt-0.5">
            {topParts.map((tag) => (
              <Tag key={tag} variant="part">
                {tag}
              </Tag>
            ))}
            {topGenres.map((tag) => (
              <Tag key={tag} variant="genre">
                {tag}
              </Tag>
            ))}
          </div>
        </div>
      </Link>
    </Card>
  );
}
