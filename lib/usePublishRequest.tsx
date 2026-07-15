"use client";

import { useState } from "react";
import { useProfileStore, isProfileComplete } from "@/store/useProfileStore";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import ModalButton from "@/components/ui/ModalButton";

/**
 * AK-2: 공개로 이어지는 모든 진입점(내 이력서 카드 / 이력서 상세)이 이 훅 하나만 쓴다.
 * 공개 규칙이 두 벌로 갈라지지 않도록 검증·확인 모달·토스트를 여기서 함께 들고 있는다.
 *
 * 규칙:
 * 1. 이미 공개 중이면 → 비공개로 되돌린다
 * 2. 필수 항목이 덜 찼으면 → 막고 이유를 알린다 (UT 전에는 아무 반응 없이 무시됐다)
 * 3. 다른 이력서가 공개 중이면 → 교체 여부를 확인받는다 (구직란에는 한 번에 하나만)
 * 4. 그 외 → 바로 공개
 */
export function usePublishRequest() {
  const resumes = useProfileStore((s) => s.resumes);
  const { publishResume, unpublishResume } = useProfileStore((s) => s.actions);
  const toast = useToast();
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; replacingTitle: string } | null>(null);

  const requestPublish = (id: string) => {
    const resume = resumes.find((r) => r.id === id);
    if (!resume) return;

    if (resume.isPublished) {
      unpublishResume(id);
      toast.show("비공개로 바꿨어요. 구직란에서 내려갔어요");
      return;
    }

    if (!isProfileComplete(resume.profile)) {
      toast.show("필수 항목을 다 채워야 올릴 수 있어요", "danger");
      return;
    }

    const currentlyPublished = resumes.find((r) => r.isPublished && r.id !== id);
    if (currentlyPublished) {
      setConfirmTarget({ id, replacingTitle: currentlyPublished.profile.nickname });
      return;
    }

    publishResume(id);
    toast.show("구직란에 올렸어요");
  };

  const confirmModal = confirmTarget ? (
    <Modal onClose={() => setConfirmTarget(null)}>
      <h2 className="text-title font-semibold text-neutral-900">
        &lsquo;{confirmTarget.replacingTitle}&rsquo;이 비공개로 바뀌어요.
      </h2>
      <p className="text-body-sm text-neutral-500">구직란에는 한 번에 하나만 올릴 수 있어요.</p>
      <div className="flex flex-col gap-2 pt-2">
        <ModalButton
          variant="primary"
          onClick={() => {
            publishResume(confirmTarget.id);
            setConfirmTarget(null);
            toast.show("구직란에 올렸어요");
          }}
        >
          그래도 올리기
        </ModalButton>
        <ModalButton variant="secondary" onClick={() => setConfirmTarget(null)}>
          취소
        </ModalButton>
      </div>
    </Modal>
  ) : null;

  return { requestPublish, confirmModal };
}
