"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  caption?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function CollapsibleSection({ title, caption, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-t border-neutral-200 pt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="flex items-center gap-2">
          <span className="text-h3 font-semibold text-neutral-900">{title}</span>
          {caption && <span className="text-caption text-primary-600">{caption}</span>}
        </span>
        <ChevronDown size={18} className={`text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && <div className="mt-5 space-y-5">{children}</div>}
    </section>
  );
}
