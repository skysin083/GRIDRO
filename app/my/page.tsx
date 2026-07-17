"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useProfileStore, MAX_RESUMES } from "@/store/useProfileStore";
import { usePublishRequest } from "@/lib/usePublishRequest";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useToast } from "@/components/ui/Toast";
import ResumeCard from "@/components/ResumeCard";
import PageHeader from "@/components/ui/PageHeader";

export default function MyPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();
  const resumes = useProfileStore((s) => s.resumes);
  const { deleteResume, bumpResume } = useProfileStore((s) => s.actions);
  // AK-2: 공개 규칙·확인 모달·토스트는 훅 하나에서 온다 (이력서 상세와 동일한 동작).
  const { requestPublish, confirmModal } = usePublishRequest();
  const toast = useToast();

  if (loading || !user) return null;

  return (
    <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-14 space-y-10">
      <PageHeader
        title="내 이력서"
        lead="최대 3개까지 만들 수 있고, 구직란에는 한 번에 하나만 올라가요."
      />

      {/* 카드가 너무 커서 부담스럽다는 피드백 — 4열로 좁혀 카드를 작게 한다(구직란과도 열 수가 맞는다). */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {/* 고정 비율(aspect)로 이력서 카드 높이를 눈대중 근사하던 탓에 카드와 하단이 93px 어긋났다.
            비율을 버리고 그리드의 stretch에 높이를 맡기면 카드 내용이 바뀌어도 바닥이 항상 맞는다.
            min-h는 이력서가 하나도 없어 맞출 카드가 없을 때의 최소 크기다. */}
        {resumes.length < MAX_RESUMES ? (
          <button
            type="button"
            onClick={() => router.push("/write")}
            className="card-hover w-full min-h-[360px] flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-neutral-400 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-500"
          >
            <Plus size={24} />
            <span className="text-body-sm font-medium">새 이력서 작성</span>
            <span className="text-caption text-neutral-400">3분이면 첫 이력서를 만들 수 있어요</span>
          </button>
        ) : (
          <div className="w-full min-h-[360px] flex flex-col items-center justify-center gap-2 rounded-lg bg-neutral-100 text-neutral-400 text-center px-4">
            <Plus size={24} />
            <span className="text-body-sm font-medium">이력서는 {MAX_RESUMES}개까지 만들 수 있어요</span>
          </div>
        )}

        {resumes.map((resume) => (
          <ResumeCard
            key={resume.id}
            resume={resume}
            onEdit={() => router.push(`/write?id=${resume.id}`)}
            onDelete={() => {
              deleteResume(resume.id);
              toast.show("이력서를 삭제했어요");
            }}
            onRequestPublish={() => requestPublish(resume.id)}
            onBump={() => {
              bumpResume(resume.id);
              toast.show("구직란 맨 위로 올렸어요");
            }}
            onPdf={() => router.push(`/profile/${resume.id}?print=1`)}
          />
        ))}
      </div>

      {confirmModal}
    </div>
  );
}
