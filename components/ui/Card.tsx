import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
}

export default function Card({ children, hoverable = true, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-neutral-200 bg-neutral-0 overflow-hidden ${
        hoverable ? "card-hover" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
