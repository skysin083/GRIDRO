import { InputHTMLAttributes } from "react";

export default function Input({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full text-body-sm text-neutral-800 placeholder:text-neutral-400 bg-white border border-neutral-200 rounded-md px-4 py-[14px] outline-none transition-colors duration-[.18s] hover:border-neutral-400 focus:border-primary-500 disabled:bg-neutral-100 disabled:text-neutral-400 ${className}`}
      {...rest}
    />
  );
}
