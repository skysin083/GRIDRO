import { create } from "zustand";
import { Profile } from "@/types/profile";
import { dummyProfiles } from "@/data/dummyProfiles";

export interface Resume {
  id: string;
  profile: Profile;
  createdAt: number;
  isPublished: boolean;
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
// UT: "24시간 너무 잦지 않아? 한 48시간으로 해… 48시간 이상도 괜찮을 것 같아"(재갈)
export const BUMP_COOLDOWN_MS = 48 * 60 * 60 * 1000;

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
    // 불호 장르는 UT 결과 필수에서 제외했다(묵해: "가릴 처지가 아닐 것 같아요") — FIELD_ORDER와 동일하게 유지.
    profile.tools.length > 0 &&
    profile.workTypes.length > 0
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
      };
      set({ resumes: [...get().resumes, newResume] });
      return newId;
    },
    deleteResume: (id) => set({ resumes: get().resumes.filter((r) => r.id !== id) }),
    // publishedAt = "공개한 시각" = "끌올한 시각" (같은 의미, 별도 필드 두지 않는다). 공개 전환마다 갱신.
    publishResume: (id) =>
      set({
        resumes: get().resumes.map((r) => {
          if (r.id === id) return { ...r, isPublished: true, profile: { ...r.profile, publishedAt: Date.now() } };
          if (r.isPublished) return { ...r, isPublished: false, profile: { ...r.profile, publishedAt: null } };
          return r;
        }),
      }),
    unpublishResume: (id) =>
      set({
        resumes: get().resumes.map((r) =>
          r.id === id ? { ...r, isPublished: false, profile: { ...r.profile, publishedAt: null } } : r
        ),
      }),
    bumpResume: (id) =>
      set({
        resumes: get().resumes.map((r) =>
          r.id === id ? { ...r, profile: { ...r.profile, publishedAt: Date.now() } } : r
        ),
      }),
  },
}));
