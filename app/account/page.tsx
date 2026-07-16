"use client";

import Link from "next/link";
import { LogOut, Mail } from "lucide-react";
import { useProfileStore } from "@/store/useProfileStore";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

/**
 * 마이페이지. 아직 로그인(Supabase Auth)이 안 붙어 있어 "계정"이라 부를 실체가 없다 —
 * 그래서 이 페이지는 지금 가진 것(작성한 이력서, 북마크)만 정직하게 보여주고,
 * 로그인이 있어야만 의미가 생기는 항목(이메일 계정, 로그아웃)은 비활성 상태로 자리만 잡아둔다.
 * 로그인 연동 후에는 "대표 이력서 기준" 표시를 실제 계정 정보로 바꾸기만 하면 된다.
 */
export default function AccountPage() {
  const resumes = useProfileStore((s) => s.resumes);
  const dummyProfiles = useProfileStore((s) => s.dummyProfiles);
  const bookmarkedIds = useProfileStore((s) => s.bookmarkedIds);

  // 대표로 보여줄 이력서: 공개 중인 게 있으면 그걸, 없으면 가장 최근에 만든 것.
  const published = resumes.find((r) => r.isPublished);
  const primary = published ?? [...resumes].sort((a, b) => b.createdAt - a.createdAt)[0];

  const bookmarkedProfiles = bookmarkedIds
    .map((id) => resumes.find((r) => r.id === id)?.profile ?? dummyProfiles.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <div className="max-w-[720px] mx-auto px-5 md:px-10 py-14 space-y-8">
      <PageHeader title="마이페이지" />

      {/* 프로필 요약 — 대표 이력서 기준 */}
      <Card hover="none" className="p-6">
        {primary ? (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-100 shrink-0">
              {primary.profile.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={primary.profile.images[0]}
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
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {bookmarkedProfiles.map((profile) => (
              <Link
                key={profile.id}
                href={`/profile/${profile.id}`}
                className="group space-y-1.5"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 transition-colors group-hover:border-neutral-300">
                  {profile.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.images[0]}
                      alt={`${profile.nickname} 대표 그림`}
                      className="w-full h-full object-cover object-top"
                    />
                  )}
                </div>
                <p className="text-caption font-medium text-neutral-600 truncate">{profile.nickname}</p>
              </Link>
            ))}
          </div>
        ) : (
          <Card hover="none">
            <EmptyState message="구직란에서 마음에 드는 작가를 북마크해보세요" actionLabel="구직란 보기" actionHref="/feed" />
          </Card>
        )}
      </div>

      {/* 계정 — 로그인 연동 전이라 실제 계정 이메일이 아니라 대표 이력서 이메일을 대신 보여준다 */}
      <Card hover="none" className="p-6 space-y-4">
        <p className="text-body-sm font-bold text-neutral-900">계정</p>
        <div className="flex items-center gap-2 text-body-sm text-neutral-600">
          <Mail size={16} className="text-neutral-400 shrink-0" />
          <span className="truncate">{primary?.profile.email || "등록된 이메일이 없어요"}</span>
        </div>
        <p className="text-caption text-neutral-400">
          로그인 연동 전이라 이력서에 적은 이메일을 대신 보여드려요.
        </p>
        <Button variant="outline" size="sm" disabled className="gap-1.5">
          <LogOut size={14} />
          로그아웃
        </Button>
        <p className="text-caption text-neutral-400">로그인 연동 후 사용할 수 있어요</p>
      </Card>
    </div>
  );
}
