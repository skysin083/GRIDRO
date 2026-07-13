"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Profile } from "@/types/profile";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";

export default function ProfileCard({ profile }: { profile: Profile }) {
  const [bookmarked, setBookmarked] = useState(false);
  const topParts = profile.parts.slice(0, 2);
  const topGenres = profile.preferredGenres.slice(0, 2);

  return (
    <Card hover="subtle" className="group">
      <Link href={`/profile/${profile.id}`} className="block">
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-neutral-100">
          {profile.images[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.images[0]}
              alt={`${profile.nickname} 대표 그림`}
              className="w-full h-full object-cover object-top"
            />
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setBookmarked((v) => !v);
            }}
            aria-label="북마크"
            aria-pressed={bookmarked}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/[.55] backdrop-blur-sm hover:bg-white/[.85] flex items-center justify-center transition-colors"
          >
            <Bookmark
              size={14}
              className={
                bookmarked ? "fill-neutral-900 text-neutral-900" : "text-neutral-600 hover:text-neutral-900"
              }
            />
          </button>
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
