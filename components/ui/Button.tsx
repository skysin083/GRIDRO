import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "dark-pill" | "outline" | "ghost";

// Z-1: 페이지 레벨 버튼(Button)은 전부 pill, 모달 내부 버튼은 ModalButton(12px 직사각)만 사용한다.
// AI-3: 페이지 레벨 버튼은 클릭 애니메이션 없이 즉시 액션, hover만 동일하게(-2px + 그림자) 적용한다.
const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-primary-500 text-white hover:bg-primary-600 rounded-pill hover:-translate-y-0.5 hover:shadow-btn",
  "dark-pill": "bg-neutral-900 text-white hover:bg-neutral-700 rounded-pill hover:-translate-y-0.5 hover:shadow-btn",
  outline:
    "bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-300 rounded-pill hover:-translate-y-0.5 hover:shadow-btn",
  ghost: "bg-transparent text-neutral-500 hover:text-neutral-900 rounded-pill",
};

const DISABLED_CLASSES = "disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:hover:bg-neutral-200 disabled:hover:translate-y-0 disabled:hover:shadow-none";

interface CommonProps {
  variant?: Variant;
  size?: "md" | "sm" | "lg";
  children: ReactNode;
  className?: string;
  /** Appends a "→" that nudges right on hover (dur-fast). */
  arrow?: boolean;
}

interface ButtonAsButton extends CommonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  href?: undefined;
}

interface ButtonAsLink extends CommonProps {
  href: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

export default function Button({ variant = "primary", size = "md", children, className = "", arrow = false, ...rest }: ButtonProps) {
  const sizeClasses =
    size === "sm" ? "px-3 py-1.5 text-body-sm" : size === "lg" ? "px-[34px] py-[18px] text-[16px]" : "px-4 py-2.5 text-body-sm";
  const base = `group/btn inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-[.25s] ease-[cubic-bezier(.22,.61,.36,1)] ${sizeClasses} ${VARIANT_CLASSES[variant]} ${className}`;

  const content = arrow ? (
    <>
      {children}
      <span className="inline-block transition-transform duration-[.18s] ease-[cubic-bezier(.22,.61,.36,1)] group-hover/btn:translate-x-1">
        →
      </span>
    </>
  ) : (
    children
  );

  if ("href" in rest && rest.href) {
    const { href } = rest;
    return (
      <Link href={href} className={base}>
        {content}
      </Link>
    );
  }

  const buttonRest = rest as Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;
  return (
    <button type="button" className={`${base} ${DISABLED_CLASSES}`} {...buttonRest}>
      {content}
    </button>
  );
}
