import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-neutral-900 text-white hover:bg-neutral-700",
  secondary: "bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-400",
};

interface ModalButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: Variant;
  children: ReactNode;
}

export default function ModalButton({ variant = "primary", children, ...rest }: ModalButtonProps) {
  return (
    <button
      type="button"
      className={`w-full h-[52px] rounded-[12px] font-medium text-body-sm transition-colors duration-[.18s] disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed disabled:border-neutral-200 ${VARIANT_CLASSES[variant]}`}
      {...rest}
    >
      {children}
    </button>
  );
}
