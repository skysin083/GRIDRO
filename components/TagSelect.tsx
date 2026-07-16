interface TagSelectProps {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  /** Show a numbered ①② badge on the first N selections, in selection order. */
  rankBadges?: number;
}

export default function TagSelect({ options, selected, onChange, rankBadges = 0 }: TagSelectProps) {
  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        const rank = active ? selected.indexOf(option) : -1;
        const showRank = rankBadges > 0 && rank >= 0 && rank < rankBadges;
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            // relative는 순위 배지를 얹을 때만 준다. 배지가 없는 칩까지 relative면 페인트 층이 올라가서,
            // 위쪽 경력 카드에서 연 날짜 드롭다운을 이 칩들이 덮어버린다.
            className={`${showRank ? "relative" : ""} text-body-sm px-3 py-1.5 rounded-pill border transition-colors duration-[.18s] ${
              active
                ? "bg-primary-50 text-primary-700 border-primary-500"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
            }`}
          >
            {option}
            {/* UT: 숫자만 담은 원형 배지가 알림/오류로 읽혔다("오류인 거야?" — 주일).
                6명 중 4명이 순위라는 걸 인지하지 못해, 숫자 대신 '1순위' 텍스트를 그대로 노출한다. */}
            {showRank && (
              <span className="absolute -top-2 -right-1.5 px-1.5 h-[18px] rounded-pill bg-primary-500 text-white text-[10px] font-bold leading-[18px] whitespace-nowrap">
                {rank + 1}순위
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
