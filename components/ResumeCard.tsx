"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { Resume } from "@/store/useProfileStore";
import { getRemainingCooldownMs, isProfileComplete, useProfileStore } from "@/store/useProfileStore";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { track } from "@/lib/mixpanel";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

function formatRemaining(ms: number) {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}분`;
  return `${hours}시간 ${minutes}분`;
}

interface ResumeCardProps {
  resume: Resume;
  onEdit: () => void;
  onDelete: () => void;
  onRequestPublish: () => void;
  onBump: () => void;
  onPdf: () => void;
}

export default function ResumeCard({ resume, onEdit, onDelete, onRequestPublish, onBump, onPdf }: ResumeCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [justBumped, setJustBumped] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const menuRef = useRef<HTMLDivElement>(null);
  // B방식: 쿨다운은 이력서 단위가 아닌 유저 레벨(lastActivityAt) 기준
  const lastActivityAt = useProfileStore((s) => s.lastActivityAt);
  const toast = useToast();

  useEffect(() => {
    if (!resume.isPublished) return;
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, [resume.isPublished]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const remainingMs = getRemainingCooldownMs(lastActivityAt, now);
  const onCooldown = remainingMs > 0;
  const complete = isProfileComplete(resume.profile);

  const handleBump = () => {
    const publishedAt = resume.profile.publishedAt;
    const hoursSincePublish = publishedAt ? (Date.now() - publishedAt) / (60 * 60 * 1000) : 0;
    track("bump_clicked", { hours_since_publish: Math.round(hoursSincePublish * 10) / 10 });
    onBump();
    setJustBumped(true);
    setTimeout(() => setJustBumped(false), 2000);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    if (window.confirm(`'${resume.profile.nickname}' 이력서를 삭제할까요?`)) onDelete();
  };

  return (
    <Card hover="subtle" className="group relative">
      {/* T-1: 카드 본문(이미지+텍스트) 클릭 -> 상세 이동. 쓰리닷·액션 버튼은 별도 형제 요소라 이동이 발동하지 않음 */}
      <Link href={`/profile/${resume.id}`} className="block">
        <div className="w-full aspect-[3/4] bg-neutral-100">
          {resume.profile.images[resume.profile.coverIndex ?? 0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resume.profile.images[resume.profile.coverIndex ?? 0]}
              alt={`${resume.profile.nickname} 대표 그림`}
              className="w-full h-full object-cover object-top"
            />
          )}
        </div>
        <div className="px-3 pt-3">
          {/* 닉네임 + 공개 상태 배지를 한 줄에 — 줄을 따로 쓰면 카드가 길어진다 */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-body-sm font-bold text-neutral-900 truncate">{resume.profile.nickname}</p>
            {resume.isPublished && resume.profile.publishedAt && (
              <span className="text-caption text-neutral-400 shrink-0">{formatRelativeTime(resume.profile.publishedAt)} 공개</span>
            )}
            <Badge variant={resume.isPublished ? "primary" : "neutral"}>{resume.isPublished ? "공개 중" : "비공개"}</Badge>
          </div>
        </div>
      </Link>

      <div ref={menuRef} className="absolute top-2 right-2">
        {/* UT: 호버로만 노출하던 탓에 구직자 5명 중 4명이 공개·비공개 전환을 못 찾았다.
            터치 기기에는 hover가 없어 발견 자체가 불가능하므로 상시 노출한다. */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="더보기"
          className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-neutral-700 border border-neutral-200 shadow-sm transition-colors duration-[.18s] hover:bg-neutral-100 hover:text-neutral-900"
        >
          <MoreHorizontal size={16} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-9 z-10 w-40 rounded-md border border-neutral-200 bg-white shadow-md py-1 transition-all duration-[.18s]">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onEdit();
              }}
              className="w-full text-left text-body-sm text-neutral-700 px-3 py-2 hover:bg-neutral-50"
            >
              수정
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onRequestPublish();
              }}
              className="w-full text-left text-body-sm text-neutral-700 px-3 py-2 hover:bg-neutral-50"
            >
              공개·비공개 전환
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onPdf();
              }}
              className="w-full text-left text-body-sm text-neutral-700 px-3 py-2 hover:bg-neutral-50"
            >
              PDF로 저장
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="w-full text-left text-body-sm text-danger px-3 py-2 hover:bg-[#FEF2F2]"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      <div className="px-3 pb-3 pt-2">
        {resume.isPublished ? (
          <Button
            variant="primary"
            size="md"
            className="w-full"
            disabled={onCooldown && !justBumped}
            onClick={handleBump}
          >
            {justBumped ? "맨 위로 올렸어요" : onCooldown ? `끌올 가능까지 ${formatRemaining(remainingMs)}` : "끌올"}
          </Button>
        ) : (
          // 미완성이면 버튼은 눌리지만 토스트로 안내 — 보조 텍스트 줄을 없애 카드 높이를 줄인다
          <Button
            variant="dark-pill"
            size="md"
            className="w-full"
            arrow
            onClick={() => {
              if (!complete) {
                toast.show("필수 항목을 다 채워야 올릴 수 있어요", "danger");
                return;
              }
              onRequestPublish();
            }}
          >
            구직란에 올리기
          </Button>
        )}
      </div>
    </Card>
  );
}
