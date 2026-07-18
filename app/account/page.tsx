"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, LogOut, Mail } from "lucide-react";
import { useProfileStore } from "@/store/useProfileStore";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { supabase } from "@/lib/supabaseClient";
import { fetchProfilesByIds } from "@/lib/resumesApi";
import { track } from "@/lib/mixpanel";
import { Profile } from "@/types/profile";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

// 2행(4열 기준) 분량만 기본으로 보여준다 — 북마크가 많아지면 페이지가 끝없이 길어지는 걸 막는다.
const BOOKMARK_PREVIEW_COUNT = 8;

export default function AccountPage() {
  const { user, loading } = useRequireAuth();
  const resumes = useProfileStore((s) => s.resumes);
  const bookmarkedIds = useProfileStore((s) => s.bookmarkedIds);
  const toggleBookmark = useProfileStore((s) => s.actions.toggleBookmark);
  const [showAllBookmarks, setShowAllBookmarks] = useState(false);
  const [bookmarkedProfilesById, setBookmarkedProfilesById] = useState<Record<string, Profile>>({});

  const ownResumeIds = new Set(resumes.map((r) => r.id));
  // 내 이력서를 북마크했던 과거 상태가 남아 있을 수 있어 여기서도 한 번 더 걸러낸다
  // (ProfileCard는 이제 본인 카드에 북마크 버튼 자체를 안 보여준다).
  const otherBookmarkedIds = bookmarkedIds.filter((id) => !ownResumeIds.has(id));

  useEffect(() => {
    // otherBookmarkedIds가 비어 있으면 아래 bookmarkedProfiles 계산에서 어차피 빈 배열로 걸러지므로
    // 여기서 상태를 초기화할 필요가 없다 — fetch 자체를 건너뛴다.
    if (otherBookmarkedIds.length === 0) return;
    fetchProfilesByIds(otherBookmarkedIds)
      .then((profiles) => setBookmarkedProfilesById(Object.fromEntries(profiles.map((p) => [p.id, p]))))
      .catch((e) => console.error("북마크 조회 실패", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherBookmarkedIds.join(",")]);

  // 로딩 중이거나 곧 /login으로 리다이렉트될 상태면 아무것도 그리지 않는다.
  if (loading || !user) return null;

  // 대표로 보여줄 이력서: 공개 중인 게 있으면 그걸, 없으면 가장 최근에 만든 것.
  const published = resumes.find((r) => r.isPublished);
  const primary = published ?? [...resumes].sort((a, b) => b.createdAt - a.createdAt)[0];

  const bookmarkedProfiles = otherBookmarkedIds
    .slice()
    .reverse() // 최근에 북마크한 순서로
    .map((id) => bookmarkedProfilesById[id])
    .filter((p): p is Profile => p !== undefined);

  const visibleBookmarks = showAllBookmarks
    ? bookmarkedProfiles
    : bookmarkedProfiles.slice(0, BOOKMARK_PREVIEW_COUNT);
  const hasMoreBookmarks = bookmarkedProfiles.length > BOOKMARK_PREVIEW_COUNT;

  return (
    <div className="max-w-[720px] mx-auto px-5 md:px-10 py-14 space-y-8">
      <PageHeader title="마이페이지" />

      {/* 프로필 요약 — 대표 이력서 기준 */}
      <Card hover="none" className="p-6">
        {primary ? (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-100 shrink-0">
              {primary.profile.images[primary.profile.coverIndex ?? 0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={primary.profile.images[primary.profile.coverIndex ?? 0]}
                  alt={`${primary.profile.nickname} 대표 그림`}
                  className="w-full h-full object-cover object-top"
                />
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-title font-bold text-neutral-900 truncate">{primary.profile.nickname}</p>
                {published && <Badge variant="primary">공개 중</Badge>}
              </div>
              <p className="text-body-sm text-neutral-500 truncate">{primary.profile.email}</p>
            </div>
          </div>
        ) : (
          <EmptyState
            message="아직 작성한 이력서가 없어요"
            actionLabel="이력서 만들기"
            actionHref="/write"
          />
        )}
      </Card>

      {/* 내 이력서 — 목록은 /my가 이미 있으니 여긴 요약 + 바로가기만 */}
      <Card hover="none" className="p-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-body-sm font-bold text-neutral-900">내 이력서</p>
          <p className="text-caption text-neutral-400 mt-1">
            {resumes.length > 0 ? `${resumes.length}개 작성 · ${published ? "1개 공개 중" : "공개된 이력서 없음"}` : "최대 3개까지 만들 수 있어요"}
          </p>
        </div>
        <Button href="/my" variant="outline" size="sm">
          내 이력서 보기
        </Button>
      </Card>

      {/* 북마크한 작가 */}
      <div className="space-y-3">
        <h3 className="text-body-sm font-bold text-neutral-900">북마크한 작가</h3>
        {bookmarkedProfiles.length > 0 ? (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {visibleBookmarks.map((profile) => (
                <Link
                  key={profile.id}
                  href={`/profile/${profile.id}`}
                  className="group space-y-1.5"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 transition-colors group-hover:border-neutral-300">
                    {profile.images[profile.coverIndex ?? 0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.images[profile.coverIndex ?? 0]}
                        alt={`${profile.nickname} 대표 그림`}
                        className="w-full h-full object-cover object-top"
                      />
                    )}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/30 via-black/10 to-transparent" />
                    {/* 목록이 곧 북마크한 작가라 항상 채워진 상태로 보여주고, 눌러서 즉시 해제한다(확인 모달 없음). */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        track("bookmark_removed", { source: "my_page", profile_id: profile.id });
                        toggleBookmark(profile.id);
                      }}
                      aria-label="북마크 해제"
                      className="absolute top-1 right-1 w-7 h-7 flex items-center justify-center transition-transform duration-[.18s] hover:scale-110"
                    >
                      <Bookmark
                        size={16}
                        strokeWidth={1.75}
                        className="fill-white text-white drop-shadow-[0_1px_2px_rgba(0,0,0,.35)]"
                      />
                    </button>
                  </div>
                  <p className="text-caption font-medium text-neutral-600 truncate">{profile.nickname}</p>
                </Link>
              ))}
            </div>
            {hasMoreBookmarks && (
              <button
                type="button"
                onClick={() => setShowAllBookmarks((v) => !v)}
                className="w-full text-body-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors py-2"
              >
                {showAllBookmarks ? "접기" : `${bookmarkedProfiles.length - BOOKMARK_PREVIEW_COUNT}명 더 보기`}
              </button>
            )}
          </>
        ) : (
          <Card hover="none">
            <EmptyState message="구직란에서 마음에 드는 작가를 북마크해보세요" actionLabel="구직란 보기" actionHref="/feed" />
          </Card>
        )}
      </div>

      {/* 계정 */}
      <Card hover="none" className="p-6 space-y-4">
        <p className="text-body-sm font-bold text-neutral-900">계정</p>
        <div className="flex items-center gap-2 text-body-sm text-neutral-600">
          <Mail size={16} className="text-neutral-400 shrink-0" />
          <span className="truncate">{user.email}</span>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => supabase.auth.signOut()}>
          <LogOut size={14} />
          로그아웃
        </Button>
      </Card>
    </div>
  );
}
