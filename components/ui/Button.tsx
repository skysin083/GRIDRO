import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "dark-pill" | "outline" | "ghost";

// Z-1(개정): 버튼 radius는 앱 전체가 pill 하나로 통일한다 — 페이지 버튼(Button)과 모달 버튼(ModalButton) 모두.
// 태그·칩·배지가 이미 전부 pill이라 모달만 직사각이면 그쪽이 오히려 이질적이었다.
// AN-1: (AI-3의 hover lift 규칙을 대체) 온보딩(랜딩) 페이지를 제외한 모든 화면에서 버튼 hover는
// 배경색·보더 색 변화만 허용 — translateY(들썩임)·box-shadow 변화 금지. 랜딩 전용 lift는
// app/page.tsx의 해당 Button 호출부에서 className으로 개별 추가한다.
const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-primary-500 text-white hover:bg-primary-600 rounded-pill",
  "dark-pill": "bg-neutral-900 text-white hover:bg-neutral-700 rounded-pill",
  outline: "bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-300 rounded-pill",
  ghost: "bg-transparent text-neutral-500 hover:text-neutral-900 rounded-pill",
};

const DISABLED_CLASSES = "disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:hover:bg-neutral-200";

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
