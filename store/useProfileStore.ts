import { create } from "zustand";
import { Profile } from "@/types/profile";
import { dummyProfiles } from "@/data/dummyProfiles";

export interface Resume {
  id: string;
  profile: Profile;
  createdAt: number;
  isPublished: boolean;
  lastBumpedAt: number | null;
}

interface ProfileStore {
  resumes: Resume[];
  dummyProfiles: Profile[];
  actions: {
    saveResume: (id: string | null, profile: Profile) => string;
    deleteResume: (id: string) => void;
    publishResume: (id: string) => void;
    unpublishResume: (id: string) => void;
    bumpResume: (id: string) => void;
  };
}

export const MAX_RESUMES = 3;
export const BUMP_COOLDOWN_MS = 24 * 60 * 60 * 1000;

// AK-2: 공개로 이어지는 모든 진입점(이력서 탭 카드/내 이력서 상세 등)이 이 한 곳만 참조한다.
// 필수 항목 기준은 AG-2 / app/write/page.tsx의 FIELD_ORDER required 목록과 동일하게 유지할 것.
export function isProfileComplete(profile: Profile): boolean {
  return (
    profile.nickname.trim() !== "" &&
    profile.email.trim() !== "" &&
    profile.intro.trim() !== "" &&
    profile.parts.length > 0 &&
    profile.images.length > 0 &&
    profile.preferredGenres.length > 0 &&
    profile.dislikedGenres.length > 0 &&
    profile.tools.length > 0 &&
    profile.workType !== ""
  );
}

let resumeSeq = 0;
function generateResumeId() {
  resumeSeq += 1;
  return `resume-${Date.now()}-${resumeSeq}`;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  resumes: [],
  dummyProfiles,
  actions: {
    saveResume: (id, profile) => {
      if (id) {
        set({
          resumes: get().resumes.map((r) => (r.id === id ? { ...r, profile: { ...profile, id } } : r)),
        });
        return id;
      }
      const newId = generateResumeId();
      const newResume: Resume = {
        id: newId,
        profile: { ...profile, id: newId },
        createdAt: Date.now(),
        isPublished: false,
        lastBumpedAt: null,
      };
      set({ resumes: [...get().resumes, newResume] });
      return newId;
    },
    deleteResume: (id) => set({ resumes: get().resumes.filter((r) => r.id !== id) }),
    publishResume: (id) =>
      set({
        resumes: get().resumes.map((r) =>
          r.id === id
            ? { ...r, isPublished: true, lastBumpedAt: r.lastBumpedAt ?? Date.now() }
            : { ...r, isPublished: false }
        ),
      }),
    unpublishResume: (id) =>
      set({
        resumes: get().resumes.map((r) => (r.id === id ? { ...r, isPublished: false } : r)),
      }),
    bumpResume: (id) =>
      set({
        resumes: get().resumes.map((r) => (r.id === id ? { ...r, lastBumpedAt: Date.now() } : r)),
      }),
  },
}));
