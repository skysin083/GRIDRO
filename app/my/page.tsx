"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useProfileStore, MAX_RESUMES } from "@/store/useProfileStore";
import ResumeCard from "@/components/ResumeCard";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function MyPage() {
  const router = useRouter();
  const resumes = useProfileStore((s) => s.resumes);
  const { deleteResume, publishResume, unpublishResume, bumpResume } = useProfileStore((s) => s.actions);

  const [confirmTarget, setConfirmTarget] = useState<{ id: string; replacingTitle: string } | null>(null);

  const requestPublish = (id: string) => {
    const resume = resumes.find((r) => r.id === id);
    if (!resume) return;
    if (resume.isPublished) {
      unpublishResume(id);
      return;
    }
    const currentlyPublished = resumes.find((r) => r.isPublished && r.id !== id);
    if (currentlyPublished) {
      setConfirmTarget({ id, replacingTitle: currentlyPublished.profile.nickname });
    } else {
      publishResume(id);
    }
  };

  if (resumes.length === 0) {
    return (
      <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-14">
        <PageHeader eyebrow="이력서" title="내 이력서" />
        <EmptyState message="아직 만든 이력서가 없어요" actionLabel="이력서 작성하기" actionHref="/write" />
      </div>
    );
  }

  return (
    <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-14 space-y-10">
      <PageHeader
        eyebrow="이력서"
        title="내 이력서"
        lead="최대 6개까지 만들 수 있고, 구직란에는 한 번에 하나만 올라가요."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {resumes.length < MAX_RESUMES ? (
          <button
            type="button"
            onClick={() => router.push("/write")}
            className="card-hover flex flex-col items-center justify-center gap-2 aspect-[3/4.4] rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-neutral-400 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-500"
          >
            <Plus size={24} />
            <span className="text-body-sm font-medium">새 이력서 작성</span>
          </button>
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
            onDelete={() => deleteResume(resume.id)}
            onRequestPublish={() => requestPublish(resume.id)}
            onBump={() => bumpResume(resume.id)}
          />
        ))}
      </div>

      {confirmTarget && (
        <Modal onClose={() => setConfirmTarget(null)}>
          <h2 className="text-title font-semibold text-neutral-900">
            &lsquo;{confirmTarget.replacingTitle}&rsquo;이 비공개로 바뀌어요.
          </h2>
          <p className="text-body-sm text-neutral-500">구직란에는 한 번에 하나만 올릴 수 있어요.</p>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="dark-pill"
              className="w-full"
              onClick={() => {
                publishResume(confirmTarget.id);
                setConfirmTarget(null);
              }}
            >
              그래도 올리기
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setConfirmTarget(null)}>
              취소
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
