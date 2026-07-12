interface TagSelectProps {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export default function TagSelect({ options, selected, onChange }: TagSelectProps) {
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
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`text-body-sm px-3 py-1.5 rounded-pill border transition-colors duration-[.18s] ${
              active
                ? "bg-primary-50 text-primary-700 border-primary-500"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
