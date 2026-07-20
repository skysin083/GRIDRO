"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface ImageZoomProps {
  src: string;
  alt: string;
  onClose: () => void;
}

/**
 * 지인 UT: "확대하는 기능은 없을까요… 잡기(팬)·이동 기능이 없어서 보기가 불편하다".
 * 상세에서 축소돼 보이는 원고를 원본 폭으로 크게 보고, 세로로 길면 스크롤·드래그로 훑는다.
 */
export default function ImageZoom({ src, alt, onClose }: ImageZoomProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [grabbing, setGrabbing] = useState(false);

  // 열려 있는 동안 뒤 페이지 스크롤을 막고, Esc로 닫는다.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // 마우스로 잡고 끌어 이동 (터치는 기본 스크롤이 처리한다).
  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    dragState.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop };
    setGrabbing(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    const d = dragState.current;
    if (!el || !d) return;
    el.scrollLeft = d.left - (e.clientX - d.x);
    el.scrollTop = d.top - (e.clientY - d.y);
  };
  const endDrag = () => {
    dragState.current = null;
    setGrabbing(false);
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="그림 확대 보기"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        // 배경이 밝은(흰) 원고가 스크롤로 버튼 밑까지 올라오면 반투명 흰 배경(bg-white/10)이
        // 흰 이미지에 묻혀 버튼 자체가 안 보였다 — 뒤에 뭐가 오든 항상 보이도록 불투명한
        // 어두운 배경으로 고정한다.
        className="fixed top-4 right-4 z-10 w-10 h-10 rounded-full bg-neutral-900/80 text-white flex items-center justify-center transition-colors hover:bg-neutral-900/95"
      >
        <X size={20} />
      </button>

      {/* 스크롤 컨테이너: 원본이 화면보다 크면 여기서 스크롤·드래그로 훑는다.
          이미지/컨테이너 클릭은 닫힘(backdrop)으로 새지 않게 막는다. */}
      <div
        ref={scrollRef}
        className={`h-full w-full overflow-auto overscroll-contain p-4 md:p-10 ${
          grabbing ? "cursor-grabbing" : "cursor-grab"
        }`}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="mx-auto block max-w-none select-none"
          style={{ width: "min(1000px, 92vw)" }}
        />
      </div>

      <p className="pointer-events-none fixed inset-x-0 bottom-5 text-center text-caption text-white/70">
        끌어서 이동 · 바깥이나 Esc로 닫기
      </p>
    </div>
  );
}
