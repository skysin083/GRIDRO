"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function AiPasteSection({ onComplete }: { onComplete?: () => void }) {
  const [text, setText] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleClick = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onComplete?.();
    }, 1200);
  };

  return (
    <div className="bg-primary-50 rounded-lg p-6 space-y-3">
      <h3 className="text-title font-bold text-neutral-900">이미 써둔 구직글이 있나요?</h3>
      <p className="text-body-sm text-neutral-600">
        방사 카페 등에 써둔 글을 붙여넣으면 항목별로 나눠 담아드려요.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="구직글을 여기에 붙여넣어 주세요"
        rows={4}
        maxLength={2000}
        className="w-full text-body-sm text-neutral-800 placeholder:text-neutral-400 bg-white border border-neutral-200 rounded-md px-4 py-3 outline-none transition-colors duration-[.18s] hover:border-neutral-400 focus:border-primary-500 focus:ring-[3px] focus:ring-primary-100 resize-none"
      />
      <div className="flex items-center justify-between">
        <Button variant="primary" disabled={text.trim().length < 10 || processing} onClick={handleClick}>
          {processing ? (
            <span className="dot-loading inline-flex gap-1">
              <span>●</span>
              <span>●</span>
              <span>●</span>
            </span>
          ) : (
            "AI로 정리하기"
          )}
        </Button>
        <p className="text-caption text-neutral-400">M2에서 실제 AI 분류가 연결될 예정이에요</p>
      </div>
    </div>
  );
}
