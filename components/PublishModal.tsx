import { Profile } from "@/types/profile";
import Modal from "@/components/ui/Modal";
import ModalButton from "@/components/ui/ModalButton";
import Tag from "@/components/ui/Tag";

interface PublishModalProps {
  profile: Profile;
  onPublish: () => void;
  onSaveOnly: () => void;
  onEditMore: () => void;
}

export default function PublishModal({ profile, onPublish, onSaveOnly, onEditMore }: PublishModalProps) {
  const topParts = profile.parts.slice(0, 2);
  const topGenres = profile.preferredGenres.slice(0, 2);

  return (
    <Modal onClose={onEditMore} maxWidthClassName="max-w-sm">
      <h2 className="text-title font-semibold text-neutral-900">카드가 완성됐어요</h2>

      <div className="rounded-lg overflow-hidden border border-neutral-200">
        <div className="w-full aspect-[3/4] bg-neutral-100">
          {profile.images[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.images[0]} alt="대표 그림 미리보기" className="w-full h-full object-cover object-top" />
          )}
        </div>
        <div className="p-3 space-y-1.5">
          <p className="text-[17px] font-semibold text-neutral-900 line-clamp-2 leading-snug">{profile.intro}</p>
          <p className="text-[13px] font-medium text-neutral-400">
            {profile.nickname}
            {profile.careers.length > 0 && ` · 경력 ${profile.careers.length}작품`}
          </p>
          <div className="flex flex-wrap gap-1">
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
      </div>

      {/* UT: 구직자 5명 중 4명이 스스로 비공개 저장을 골랐지만, 이 버튼이 어디에 무엇으로 저장되는지는
          아무도 읽어내지 못했다("임시 저장 같은 느낌만 돼서 여러 이력서를 만들 수 있는지 몰랐다" — 묵해).
          저장 위치와 공개 여부를 버튼과 보조문구에서 못박는다. */}
      <div className="flex flex-col gap-2">
        <ModalButton variant="primary" onClick={onPublish}>
          구직란에 올리기
        </ModalButton>
        <ModalButton variant="secondary" onClick={onSaveOnly}>
          비공개로 저장하기
        </ModalButton>
        <p className="text-caption text-neutral-400 text-center">
          &lsquo;내 이력서&rsquo;에 저장돼요. 언제든 공개로 바꿀 수 있어요
        </p>
        <button type="button" onClick={onEditMore} className="text-caption text-neutral-400 underline mt-1">
          다시 수정하기
        </button>
      </div>
    </Modal>
  );
}
