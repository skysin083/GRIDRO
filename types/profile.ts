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
  /** UT: 고정 어시와 프리랜서를 병행하는 경우가 흔해 단일 선택이 불가능했다(묵찬·이려원·재갈). */
  workTypes: string[];
  /** workTypes에 "기타"를 골랐을 때 직접 적는 설명. */
  workTypeNote: string;
  contactTimes: string[];
  contactNote: string;
  intro: string;
  bio: string;
  isNewcomer: boolean;
  careers: CareerEntry[];
  /** 공개 전환 시각(끌올 시 갱신). 비공개면 null. 작성(생성) 시각과는 별개 — 작성≠공개 원칙. */
  publishedAt: number | null;
}
