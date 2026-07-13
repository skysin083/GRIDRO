import { HTMLAttributes, ReactNode } from "react";

type HoverVariant = "full" | "subtle" | "none";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: HoverVariant;
}

const HOVER_CLASSES: Record<HoverVariant, string> = {
  full: "card-hover",
  subtle: "card-hover-subtle",
  none: "",
};

export default function Card({ children, hover = "full", className = "", ...rest }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-neutral-200 bg-neutral-0 overflow-hidden ${HOVER_CLASSES[hover]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
