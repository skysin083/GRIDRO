export type WorkStyle = "남성향" | "여성향" | "무관";
export type ToolLevel = "입문" | "중급" | "숙련";

export interface ToolSkill {
  name: string;
  level: ToolLevel;
}

export interface CareerEntry {
  id: string;
  title: string;
  startYear: number | null;
  startMonth: number | null;
  endYear: number | null;
  endMonth: number | null;
  parts: string[];
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
  tools: ToolSkill[];
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
}
