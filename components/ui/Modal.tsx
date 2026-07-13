"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  maxWidthClassName?: string;
  /** Header/scrollable-body/footer layout for the caller to compose itself (no default padding, max-h-[80vh], no built-in close button). */
  panel?: boolean;
}

export default function Modal({ onClose, children, maxWidthClassName = "max-w-[440px]", panel = false }: ModalProps) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-[.2s] ${
        entered ? "opacity-100" : "opacity-0"
      }`}
      style={{ background: "rgba(23,23,23,.5)", backdropFilter: "blur(4px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxWidthClassName} rounded-xl bg-neutral-0 transition-all duration-[.25s] ease-[cubic-bezier(.22,.61,.36,1)] ${
          panel ? "flex flex-col max-h-[80vh] overflow-hidden" : "p-5 space-y-4"
        } ${entered ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-[.96] translate-y-2"}`}
      >
        {!panel && (
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
          >
            <X size={18} />
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
