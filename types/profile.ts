export type WorkStyle = "남성향" | "여성향" | "무관";

export interface CareerEntry {
  id: string;
  title: string;
  platform: string;
  platformCustom: string;
  startYear: number | null;
  startMonth: number | null;
  endYear: number | null;
  endMonth: number | null;
  parts: string[];
  memo: string;
  link: string;
}

export interface Profile {
  id: string;
  nickname: string;
  email: string;
  images: string[];
  parts: string[];
  preferredGenres: string[];
  dislikedGenres: string[];
  tools: string[];
  workStyle: WorkStyle;
  authorTraits: string[];
  authorTraitsNote: string;
  workType: string;
  contactTime: string;
  contactNote: string;
  intro: string;
  bio: string;
  isNewcomer: boolean;
  careers: CareerEntry[];
  /** 공개 전환 시각(끌올 시 갱신). 비공개면 null. 작성(생성) 시각과는 별개 — 작성≠공개 원칙. */
  publishedAt: number | null;
}
