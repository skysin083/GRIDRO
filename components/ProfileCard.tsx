"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Profile } from "@/types/profile";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";

export default function ProfileCard({ profile }: { profile: Profile }) {
  const [bookmarked, setBookmarked] = useState(false);
  const topParts = profile.parts.slice(0, 2);
  const topGenres = profile.preferredGenres.slice(0, 2);

  return (
    <Card className="group">
      <Link href={`/profile/${profile.id}`} className="block">
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-neutral-100">
          {profile.images[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.images[0]}
              alt={`${profile.nickname} 대표 그림`}
              className="w-full h-full object-cover object-top transition-transform duration-[.4s] ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-[1.03]"
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
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-colors"
          >
            <Bookmark
              size={14}
              className={
                bookmarked ? "fill-neutral-900 text-neutral-900" : "text-neutral-500 hover:text-neutral-900"
              }
            />
          </button>
        </div>
        <div className="p-3 space-y-1.5">
          <p className="text-body-sm font-semibold text-neutral-900">{profile.nickname}</p>
          <p className="text-body-sm text-neutral-600 line-clamp-1">{profile.intro}</p>
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
