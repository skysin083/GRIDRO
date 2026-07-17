import { useEffect, useState } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import { Profile } from "@/types/profile";
import { fetchProfileById } from "@/lib/resumesApi";

export function useProfileById(id: string): { profile: Profile | undefined; loading: boolean } {
  const resumes = useProfileStore((s) => s.resumes);
  const dummyProfiles = useProfileStore((s) => s.dummyProfiles);
  // 원격 조회 결과를 id와 함께 들고 있어야 id가 바뀌었을 때 "이전 id의 결과"를 새 id의 결과로 착각하지 않는다.
  const [remote, setRemote] = useState<{ id: string; profile: Profile | undefined } | null>(null);

  const own = resumes.find((r) => r.id === id)?.profile;
  const dummy = dummyProfiles.find((p) => p.id === id);
  const local = own ?? dummy;

  useEffect(() => {
    if (local) return;
    let cancelled = false;
    fetchProfileById(id)
      .then((p) => {
        if (!cancelled) setRemote({ id, profile: p ?? undefined });
      })
      .catch((e) => {
        console.error("이력서 조회 실패", e);
        if (!cancelled) setRemote({ id, profile: undefined });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, !!local]);

  if (local) return { profile: local, loading: false };
  const isCurrent = remote?.id === id;
  return { profile: isCurrent ? remote?.profile : undefined, loading: !isCurrent };
}
