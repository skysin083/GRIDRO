"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Resume } from "@/store/useProfileStore";
import { BUMP_COOLDOWN_MS } from "@/store/useProfileStore";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

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
}

export default function ResumeCard({ resume, onEdit, onDelete, onRequestPublish, onBump }: ResumeCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [justBumped, setJustBumped] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const menuRef = useRef<HTMLDivElement>(null);

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

  const remainingMs = resume.lastBumpedAt ? BUMP_COOLDOWN_MS - (now - resume.lastBumpedAt) : 0;
  const onCooldown = remainingMs > 0;

  const handleBump = () => {
    onBump();
    setJustBumped(true);
    setTimeout(() => setJustBumped(false), 2000);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    if (window.confirm(`'${resume.profile.nickname}' 이력서를 삭제할까요?`)) onDelete();
  };

  return (
    <Card className="group relative">
      <div className="w-full aspect-[3/4] bg-neutral-100">
        {resume.profile.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resume.profile.images[0]}
            alt={`${resume.profile.nickname} 대표 그림`}
            className="w-full h-full object-cover object-top"
          />
        )}
      </div>

      <div ref={menuRef} className="absolute top-2 right-2">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="더보기"
          className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm text-neutral-400 transition-all duration-[.18s] hover:bg-neutral-100 hover:text-neutral-800 ${
            menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
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
              onClick={handleDelete}
              className="w-full text-left text-body-sm text-danger px-3 py-2 hover:bg-[#FEF2F2]"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      <div className="p-3 space-y-1.5">
        <p className="text-body-sm font-bold text-neutral-900">{resume.profile.nickname}</p>
        <div className="flex items-center gap-2">
          <span className="text-caption text-neutral-400">{formatDate(resume.createdAt)}</span>
          <Badge variant={resume.isPublished ? "primary" : "neutral"}>{resume.isPublished ? "공개 중" : "비공개"}</Badge>
        </div>

        {resume.isPublished ? (
          <Button
            variant="primary"
            size="sm"
            className="w-full mt-2"
            disabled={onCooldown && !justBumped}
            onClick={handleBump}
          >
            {justBumped ? "맨 위로 올렸어요" : onCooldown ? `끌올 가능까지 ${formatRemaining(remainingMs)}` : "끌올"}
          </Button>
        ) : (
          <Button variant="dark-pill" size="sm" className="w-full mt-2" arrow onClick={onRequestPublish}>
            구직란에 올리기
          </Button>
        )}
      </div>
    </Card>
  );
}
