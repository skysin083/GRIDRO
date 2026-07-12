import { ReactNode } from "react";

type Variant = "part" | "genre";

const VARIANT_CLASSES: Record<Variant, string> = {
  part: "bg-primary-50 text-primary-700",
  genre: "bg-neutral-100 text-neutral-600",
};

export default function Tag({ variant, children }: { variant: Variant; children: ReactNode }) {
  return (
    <span className={`inline-block text-caption px-1.5 py-0.5 rounded-sm ${VARIANT_CLASSES[variant]}`}>
      {children}
    </span>
  );
}
