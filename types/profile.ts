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
  /** Clip Studio Paint를 고른 경우의 에디션(EX/PRO). 에디션마다 되는 작업이 달라 구인자가 확인한다. */
  cspEdition: string;
  /** 에디션을 고른 뒤에만 의미가 있는 메이저 버전(예: "5"). 에디션이 비면 같이 비운다. */
  cspVersion: string;
  workStyle: WorkStyle;
  authorTraits: string[];
  authorTraitsNote: string;
  /** UT: 고정 어시와 프리랜서를 병행하는 경우가 흔해 단일 선택이 불가능했다(묵찬·이려원·재갈). */
  workTypes: string[];
  contactTimes: string[];
  contactNote: string;
  intro: string;
  bio: string;
  isNewcomer: boolean;
  careers: CareerEntry[];
  /** 공개 전환 시각(끌올 시 갱신). 비공개면 null. 작성(생성) 시각과는 별개 — 작성≠공개 원칙. */
  publishedAt: number | null;
}
