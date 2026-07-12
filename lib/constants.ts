export const PARTS = [
  "콘티",
  "선화",
  "밑색",
  "명암",
  "채색",
  "후보정",
  "배경",
  "전공정",
] as const;

export const GENRES = [
  "로맨스",
  "로판",
  "BL",
  "무협",
  "액션",
  "학원물",
  "스릴러",
  "드라마",
  "개그",
  "판타지",
] as const;

export const TOOLS = [
  "Photoshop",
  "Clip Studio Paint",
  "Procreate",
  "SAI",
  "Medibang",
] as const;

export const TOOL_LEVELS = ["입문", "중급", "숙련"] as const;

export const WORK_STYLES = ["남성향", "여성향", "무관"] as const;

export const AUTHOR_TRAITS = [
  "작업 속도 빠름",
  "피드백 수용 잘함",
  "연락 잘됨",
  "소통 원활",
  "꼼꼼함",
  "수정 대응 빠름",
] as const;

export const WORK_TYPES = [
  "프리랜서",
  "외주(단건)",
  "고정 어시",
  "파트타임",
] as const;

export const CONTACT_TIMES = [
  "평일 오전",
  "평일 오후",
  "평일 저녁",
  "주말",
  "시간 무관",
] as const;

export const PART_UPLOAD_TIPS: Record<string, string> = {
  콘티: "장면 전환·연출 흐름이 보이는 연속 2~3컷이 좋아요",
  선화: "원본 크기 컷으로 — 선의 강약과 마감을 확대해서 봐요",
  밑색: "면 분리·경계 정리가 보이는 컷 — 선화 위 밑색 상태 그대로",
  명암: "밑색 컷과 명암 후 컷을 나란히 — 실력이 가장 잘 드러나는 비교예요",
  채색: "분위기가 다른 2컷 이상 — 화풍 대응력을 보여줘요",
  후보정: "보정 전/후 비교컷 — 효과·빛 연출이 한눈에 보여요",
  배경: "인물 없는 배경 원본 — 투시·밀도를 확인해요",
  전공정: "한 컷의 콘티→완성 과정 or 완성 원고 — 전체 완성도를 봐요",
};

export const FIELD_TOOLTIPS: Record<string, string> = {
  nickname: "구직란 카드와 상세뷰에 노출되는 활동명이에요.",
  email: "컨택하기를 누른 구인자에게만 전달되는 연락처예요.",
  images: "그림이 1순위입니다. 가장 자신있는 대표작을 먼저 올리세요.",
  parts:
    "구인자는 실제로 어떤 공정을 맡길 수 있는지 파트로 먼저 걸러봅니다. 가장 자신있는 파트를 앞에 선택하세요.",
  preferredGenres:
    "선호 장르는 잘 맞는 작품에 컨택 받을 확률을 높여줍니다.",
  dislikedGenres: "불호 장르를 밝히면 서로의 미스매치를 줄일 수 있습니다.",
  tools:
    "숙련도까지 함께 적으면 실제 작업 속도와 퀄리티를 가늠하는 데 도움이 됩니다.",
  workStyle:
    "작품 성향에 따라 그림체·수위가 갈리므로, 무관이 아니라면 명확히 밝히는 게 서로에게 좋습니다.",
  authorTraits: "실력만큼 협업 방식도 중요한 판단 기준입니다. 솔직하게 선택하세요.",
  workType: "근무 형태가 맞아야 컨택이 성사될 확률이 높아집니다.",
  contactTime:
    "연락 가능한 시간대를 명확히 하면 응답 지연으로 인한 이탈을 줄일 수 있습니다.",
  intro: "카드에 노출되는 첫 인상입니다. 핵심 강점을 한 문장으로 요약하세요.",
  bio: "상세뷰에 노출되는 자유 소개글입니다. 작업 스타일이나 협업 방식을 적으면 좋아요.",
};
