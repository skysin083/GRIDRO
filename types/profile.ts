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
  /** 연재 주기 (주간연재·격주연재 등). 선택 필드 — 기존 데이터 호환을 위해 optional. */
  serialCycle?: string;
}

export interface Profile {
  id: string;
  nickname: string;
  email: string;
  images: string[];
  /** 구직란 카드·상세 대표 이미지로 쓰이는 인덱스. 순서와 독립적으로 관리. 기본값 0. */
  coverIndex?: number;
  /** 이미지마다 붙이는 짧은 캡션. images와 같은 인덱스. */
  imageCaptions?: string[];
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
