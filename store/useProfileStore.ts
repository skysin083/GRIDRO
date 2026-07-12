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

export const MAX_RESUMES = 6;
export const BUMP_COOLDOWN_MS = 24 * 60 * 60 * 1000;

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
