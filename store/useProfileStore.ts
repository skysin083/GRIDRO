import { create } from "zustand";
import { Profile } from "@/types/profile";
import { useAuthStore } from "@/store/useAuthStore";
import { deleteResumeRow, fetchMyResumes, uploadResumeImages, upsertResumeRow } from "@/lib/resumesApi";

export interface Resume {
  id: string;
  profile: Profile;
  createdAt: number;
  isPublished: boolean;
}

interface ProfileStore {
  resumes: Resume[];
  /** B방식 유저 레벨 쿨다운 — 공개/끌올 모두 이 시각 기준 48h 공유 */
  lastActivityAt: number | null;
  /** 구직란 카드에서 북마크한 프로필 id 목록. 마이페이지 "북마크한 작가"가 이걸 그대로 읽는다. */
  bookmarkedIds: string[];
  actions: {
    saveResume: (id: string | null, profile: Profile) => string;
    /** saveResume(로컬 낙관적 반영) + 이미지 업로드 + Supabase resumes 행 upsert. 명시적 저장 시점(임시저장·공개·비공개 저장)에서만 쓴다. */
    persistResume: (id: string | null, profile: Profile) => Promise<string>;
    deleteResume: (id: string) => void;
    /** 로컬 낙관적 반영 뒤 Supabase 동기화까지 기다린다 — 반환값을 await하면 "행이 실제로 저장됐다"를 보장한다. */
    publishResume: (id: string) => Promise<void>;
    unpublishResume: (id: string) => Promise<void>;
    bumpResume: (id: string) => Promise<void>;
    toggleBookmark: (id: string) => void;
    /** 로그인 감지 시 해당 유저의 resumes를 Supabase에서 불러와 로컬 상태를 채운다. */
    hydrateFromRemote: (userId: string) => Promise<void>;
    /** 로그아웃 시 로컬에 남은 이전 유저의 resumes를 비운다. */
    clearRemote: () => void;
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

/**
 * B방식 유저 레벨 쿨다운 체크.
 * 끌올(bumpResume)과 공개(publishResume) 모두 lastActivityAt 기준 48h를 공유한다.
 * 비공개→재공개를 반복해도 쿨다운이 소비되므로 피드 어뷰징을 방지한다.
 */
export function getRemainingCooldownMs(lastActivityAt: number | null, now: number): number {
  if (lastActivityAt == null) return 0;
  return Math.max(0, BUMP_COOLDOWN_MS - (now - lastActivityAt));
}

// Supabase resumes.id가 uuid 컬럼이라 클라이언트 생성 id도 처음부터 uuid로 맞춘다.
function generateResumeId() {
  return crypto.randomUUID();
}

/** publishResume/unpublishResume/bumpResume 등 로컬 우선 액션 뒤에 붙는 원격 동기화.
 * 항상 resolve된다(실패해도 catch에서 삼킴) — 로컬 상태는 이미 반영돼 있고, 다음 로그인/새로고침 때
 * hydrateFromRemote로 다시 맞춰진다. 호출부가 await하면 "행이 실제로 저장됐다"까지 기다릴 수 있다. */
function syncResumesToRemote(resumes: Resume[]): Promise<void> {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) return Promise.resolve();
  return Promise.all(resumes.map((r) => upsertResumeRow(userId, r)))
    .then(() => undefined)
    .catch((e) => {
      console.error("이력서 동기화 실패", e);
    });
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  resumes: [],
  lastActivityAt: null,
  bookmarkedIds: [],
  actions: {
    toggleBookmark: (id) =>
      set({
        bookmarkedIds: get().bookmarkedIds.includes(id)
          ? get().bookmarkedIds.filter((b) => b !== id)
          : [...get().bookmarkedIds, id],
      }),
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
    deleteResume: (id) => {
      set({ resumes: get().resumes.filter((r) => r.id !== id) });
      if (useAuthStore.getState().user) {
        deleteResumeRow(id).catch((e) => console.error("이력서 삭제 동기화 실패", e));
      }
    },
    // publishedAt = "공개한 시각" = "끌올한 시각" (같은 의미, 별도 필드 두지 않는다).
    // B방식: 쿨다운 중이면 publishedAt을 갱신하지 않아 피드 순서가 바뀌지 않는다.
    //         쿨다운이 끝났으면 lastActivityAt + publishedAt 모두 갱신해 피드 맨 위로 올린다.
    publishResume: async (id) => {
      const now = Date.now();
      const remaining = getRemainingCooldownMs(get().lastActivityAt, now);
      const onCooldown = remaining > 0;
      set({
        // 쿨다운이 끝난 첫 공개만 lastActivityAt 갱신 (쿨다운 중 재공개는 갱신 안 함)
        lastActivityAt: onCooldown ? get().lastActivityAt : now,
        resumes: get().resumes.map((r) => {
          if (r.id === id) {
            return {
              ...r,
              isPublished: true,
              profile: {
                ...r.profile,
                // 쿨다운 중 재공개: publishedAt 유지 → 피드 순서 변동 없음
                publishedAt: onCooldown ? r.profile.publishedAt : now,
              },
            };
          }
          // 다른 공개 이력서는 비공개 처리
          if (r.isPublished) return { ...r, isPublished: false, profile: { ...r.profile, publishedAt: null } };
          return r;
        }),
      });
      await syncResumesToRemote(get().resumes);
    },
    unpublishResume: async (id) => {
      set({
        resumes: get().resumes.map((r) =>
          r.id === id ? { ...r, isPublished: false, profile: { ...r.profile, publishedAt: null } } : r
        ),
      });
      await syncResumesToRemote(get().resumes);
    },
    bumpResume: async (id) => {
      const now = Date.now();
      set({
        lastActivityAt: now,
        resumes: get().resumes.map((r) =>
          r.id === id ? { ...r, profile: { ...r.profile, publishedAt: now } } : r
        ),
      });
      await syncResumesToRemote(get().resumes);
    },
    persistResume: async (id, profile) => {
      const savedId = get().actions.saveResume(id, profile);
      const userId = useAuthStore.getState().user?.id;
      if (!userId) return savedId;
      try {
        const images = await uploadResumeImages(userId, profile.images);
        get().actions.saveResume(savedId, { ...profile, id: savedId, images });
        const resume = get().resumes.find((r) => r.id === savedId);
        if (resume) await upsertResumeRow(userId, resume);
      } catch (e) {
        console.error("이력서 원격 저장 실패", e);
      }
      return savedId;
    },
    hydrateFromRemote: async (userId) => {
      try {
        const resumes = await fetchMyResumes(userId);
        const lastActivityAt = resumes.reduce((max, r) => Math.max(max, r.profile.publishedAt ?? 0), 0) || null;
        set({ resumes, lastActivityAt });
      } catch (e) {
        console.error("이력서 불러오기 실패", e);
      }
    },
    clearRemote: () => set({ resumes: [], lastActivityAt: null }),
  },
}));

