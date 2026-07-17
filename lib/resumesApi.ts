import { supabase } from "@/lib/supabaseClient";
import { Profile } from "@/types/profile";
import { Resume } from "@/store/useProfileStore";

const BUCKET = "resume-images";

function extFromMimeType(type: string): string {
  const match = /\/([a-zA-Z0-9]+)$/.exec(type);
  return match ? match[1] : "jpg";
}

/** profile.images 중 blob: URL만 Storage에 업로드해 영구 URL로 치환한다. 이미 업로드된(https://) 이미지는 그대로 통과. */
export async function uploadResumeImages(userId: string, images: string[]): Promise<string[]> {
  return Promise.all(
    images.map(async (url) => {
      if (!url.startsWith("blob:")) return url;
      const blob = await fetch(url).then((r) => r.blob());
      const path = `${userId}/${crypto.randomUUID()}.${extFromMimeType(blob.type)}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type });
      if (error) throw error;
      return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    })
  );
}

export async function upsertResumeRow(userId: string, resume: Resume): Promise<void> {
  const { error } = await supabase.from("resumes").upsert({
    id: resume.id,
    user_id: userId,
    data: resume.profile,
    is_published: resume.isPublished,
    // data(jsonb) 안의 publishedAt과 같은 값을 top-level 컬럼에도 반영 — 실제 테이블에 이 컬럼이 있다.
    published_at: resume.profile.publishedAt ? new Date(resume.profile.publishedAt).toISOString() : null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function deleteResumeRow(id: string): Promise<void> {
  const { error } = await supabase.from("resumes").delete().eq("id", id);
  if (error) throw error;
}

interface ResumeRow {
  id: string;
  data: Profile;
  is_published: boolean;
  created_at: string;
}

export async function fetchMyResumes(userId: string): Promise<Resume[]> {
  const { data, error } = await supabase
    .from("resumes")
    .select("id, data, is_published, created_at")
    .eq("user_id", userId);
  if (error) throw error;
  return (data as ResumeRow[]).map((row) => ({
    id: row.id,
    profile: row.data,
    isPublished: row.is_published,
    createdAt: new Date(row.created_at).getTime(),
  }));
}

/** 구직란(feed)용 — 전체 유저 대상 공개 이력서. 비로그인 방문자도 호출한다(RLS가 공개 행은 anon에도 열어둠). */
export async function fetchPublishedProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from("resumes").select("data").eq("is_published", true);
  if (error) throw error;
  return (data as { data: Profile }[]).map((row) => row.data);
}

/** 다른 유저의 공개 이력서 상세 조회용. 없거나 비공개면 null. */
export async function fetchProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("resumes").select("data").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return (data as { data: Profile }).data;
}
