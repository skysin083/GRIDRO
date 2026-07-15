"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useProfileStore, MAX_RESUMES } from "@/store/useProfileStore";
import { usePublishRequest } from "@/lib/usePublishRequest";
import { useToast } from "@/components/ui/Toast";
import ResumeCard from "@/components/ResumeCard";
import PageHeader from "@/components/ui/PageHeader";

export default function MyPage() {
  const router = useRouter();
  const resumes = useProfileStore((s) => s.resumes);
  const { deleteResume, bumpResume } = useProfileStore((s) => s.actions);
  // AK-2: 공개 규칙·확인 모달·토스트는 훅 하나에서 온다 (이력서 상세와 동일한 동작).
  const { requestPublish, confirmModal } = usePublishRequest();
  const toast = useToast();

  return (
    <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-14 space-y-10">
      <PageHeader
        title="내 이력서"
        lead="최대 3개까지 만들 수 있고, 구직란에는 한 번에 하나만 올라가요."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {resumes.length < MAX_RESUMES ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => router.push("/write")}
              className="card-hover w-full flex flex-col items-center justify-center gap-2 aspect-[3/4.4] rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-neutral-400 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-500"
            >
              <Plus size={24} />
              <span className="text-body-sm font-medium">새 이력서 작성</span>
            </button>
            <p className="text-caption text-neutral-400 text-center">3분이면 첫 이력서를 만들 수 있어요</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 aspect-[3/4.4] rounded-lg bg-neutral-100 text-neutral-400 text-center px-4">
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
