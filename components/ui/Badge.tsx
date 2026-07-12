import { ReactNode } from "react";

type Variant = "info" | "neutral" | "primary";

const VARIANT_CLASSES: Record<Variant, string> = {
  info: "bg-info/10 text-info",
  neutral: "bg-neutral-100 text-neutral-500",
  primary: "bg-primary-50 text-primary-700",
};

export default function Badge({ variant, children }: { variant: Variant; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center text-caption font-medium px-2 py-0.5 rounded-pill ${VARIANT_CLASSES[variant]}`}>
      {children}
    </span>
  );
}
