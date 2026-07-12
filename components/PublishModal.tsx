import { Profile } from "@/types/profile";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
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
          <p className="text-body-sm font-semibold text-neutral-900">{profile.nickname}</p>
          <p className="text-body-sm text-neutral-600 line-clamp-1">{profile.intro}</p>
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

      <p className="text-caption text-neutral-500">
        지금 공개할지, 이력서 탭에 저장만 해둘지 선택할 수 있어요. 나중에 언제든 바꿀 수 있습니다.
      </p>

      <div className="flex flex-col gap-2">
        <Button variant="dark-pill" className="w-full" onClick={onPublish}>
          구직란에 올리기
        </Button>
        <Button variant="outline" className="w-full" onClick={onSaveOnly}>
          저장하고 둘러보기
        </Button>
        <button type="button" onClick={onEditMore} className="text-caption text-neutral-400 underline mt-1">
          다시 수정하기
        </button>
      </div>
    </Modal>
  );
}
