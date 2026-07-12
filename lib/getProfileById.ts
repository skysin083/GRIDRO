import { useProfileStore } from "@/store/useProfileStore";
import { Profile } from "@/types/profile";

export function useProfileById(id: string): Profile | undefined {
  const resumes = useProfileStore((s) => s.resumes);
  const dummyProfiles = useProfileStore((s) => s.dummyProfiles);

  const own = resumes.find((r) => r.id === id)?.profile;
  if (own) return own;
  return dummyProfiles.find((p) => p.id === id);
}
