"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Check, Info, TriangleAlert } from "lucide-react";

const TOAST_DURATION_MS = 3000;

// 색 토큰이 success/danger/info 3종뿐이라 경고도 danger를 쓴다(새 토큰을 늘리지 않는다).
type ToastVariant = "success" | "danger" | "info";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastApi {
  /** 짧은 확인 메시지를 띄운다. 같은 액션을 연타해도 마지막 것만 남는다. */
  show: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast는 ToastProvider 안에서만 쓸 수 있어요");
  return ctx;
}

const VARIANT_ICON: Record<ToastVariant, typeof Check> = {
  success: Check,
  danger: TriangleAlert,
  info: Info,
};

const VARIANT_ICON_CLASS: Record<ToastVariant, string> = {
  success: "text-success",
  danger: "text-danger",
  info: "text-info",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const show = useCallback((message: string, variant: ToastVariant = "success") => {
    seq.current += 1;
    const id = seq.current;
    // 액션을 연타해도 토스트가 쌓이지 않도록 항상 최신 하나만 보여준다.
    setToasts([{ id, message, variant }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), TOAST_DURATION_MS);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* 작성 화면 하단에 고정 저장 바가 있어 토스트는 상단(헤더 아래)에 띄운다. */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="print:hidden pointer-events-none fixed top-20 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2 px-4"
      >
        {toasts.map(({ id, message, variant }) => {
          const Icon = VARIANT_ICON[variant];
          return (
            <div
              key={id}
              className="toast-in pointer-events-auto flex items-center gap-2 rounded-pill bg-neutral-900 px-4 py-2.5 text-body-sm font-medium text-white shadow-md"
            >
              <Icon size={15} className={`shrink-0 ${VARIANT_ICON_CLASS[variant]}`} />
              <span>{message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
