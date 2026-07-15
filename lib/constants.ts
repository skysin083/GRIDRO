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

// UT: BL과 GL은 작업 조건이 갈리는 별개 장르라 묶으면 안 된다는 요구가 3명에게서 나왔다(묵찬·묵해·이려원).
export const GENRES = [
  "로맨스",
  "로판",
  "BL",
  "GL",
  "무협",
  "액션",
  "학원물",
  "스릴러",
  "드라마",
  "개그",
  "판타지",
] as const;

export const TOOLS = [
  "Clip Studio Paint",
  "Photoshop",
  "Procreate",
  "SAI",
  "Medibang",
  "SketchUp",
  "에이블러(ABLUR)",
] as const;

export const WORK_STYLES = ["남성향", "여성향", "무관"] as const;

export const AUTHOR_TRAITS = [
  "작업 속도 빠름",
  "피드백 수용 잘함",
  "연락 잘됨",
  "소통 원활",
  "꼼꼼함",
  "수정 대응 빠름",
] as const;

// UT: "어디서는 고정을 치는데 어디서는 프리랜서예요… 기타라도 있었으면"(묵찬) — 복수 선택 + 기타로 연다.
export const WORK_TYPES = [
  "프리랜서",
  "외주(단건)",
  "고정 어시",
  "기타",
] as const;

export const PLATFORMS = [
  "네이버웹툰",
  "카카오웹툰",
  "카카오페이지",
  "레진코믹스",
  "봄툰",
  "리디",
  "포스타입",
  "탑툰",
  "미스터블루",
  "기타",
  "비연재·개인 작업",
] as const;

export const CONTACT_TIMES = [
  "평일 오전",
  "평일 오후",
  "평일 저녁",
  "주말",
  "시간 무관",
] as const;

export const PART_UPLOAD_TIPS: Record<string, string> = {
  콘티: "컷 흐름이 보이는 연속 2~3컷을 올리면 연출력이 한눈에 보여요",
  선화: "펜선 강약이 드러나는 인물 컷을 원본 해상도로 올려주세요",
  밑색: "선화 위에 밑색만 올린 컷이 있으면 영역 정리 실력이 바로 보여요",
  명암: "밑색→명암 비교컷이 있으면 입체 표현이 한눈에 들어와요",
  채색: "채색 전·후 비교컷이 있으면 실력이 한눈에 보여요",
  후보정: "보정 전·후 비교컷으로 색감과 무드 변화를 보여주세요",
  배경: "인물 없는 배경 단독 컷과 투시가 드러나는 컷이 좋아요",
  전공정: "한 컷을 공정 단계별로 나눠 보여주면 전체 실력이 정리돼요",
};

