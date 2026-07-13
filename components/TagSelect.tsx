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
            className={`relative text-body-sm px-3 py-1.5 rounded-pill border transition-colors duration-[.18s] ${
              active
                ? "bg-primary-50 text-primary-700 border-primary-500"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
            }`}
          >
            {option}
            {showRank && (
              <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-primary-500 text-white text-[11px] font-bold flex items-center justify-center">
                {rank + 1}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
