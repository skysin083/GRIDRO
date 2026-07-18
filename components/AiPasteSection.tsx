"use client";

import { useState } from "react";
import { Sparkle } from "lucide-react";
import Button from "@/components/ui/Button";
import { track } from "@/lib/mixpanel";

export default function AiPasteSection({ onComplete }: { onComplete?: () => void }) {
  const [text, setText] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleClick = () => {
    track("ai_paste_used", { text_length: text.length });
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onComplete?.();
    }, 1200);
  };

  return (
    <div className="bg-primary-50 border border-primary-200 rounded-md p-6 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkle size={18} className="text-primary-500" fill="currentColor" />
        <h3 className="text-title font-bold text-neutral-900">AI로 이력서 자동 정리</h3>
      </div>
      <p className="text-body-sm text-neutral-600">
        방사 카페 등에 써둔 글을 붙여넣으면 항목별로 나눠 담아드려요.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="방사 카페 등에 써둔 구직글을 붙여넣어 주세요"
        rows={4}
        maxLength={2000}
        className="w-full text-body-sm text-neutral-800 placeholder:text-neutral-400 bg-white border border-neutral-200 rounded-md px-4 py-3 outline-none transition-colors duration-[.18s] hover:border-neutral-400 focus:border-primary-500 resize-none"
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
      <div className="space-y-0.5 pt-1 border-t border-primary-100">
        <p className="text-caption text-neutral-500 pt-2">
          AI가 항목을 완벽하게 나누지 못할 수 있어요. 옮겨진 내용은 꼭 확인하고 고쳐주세요.
        </p>
        <p className="text-caption text-neutral-400">글만 읽어요. 그림은 분석하지 않아요.</p>
      </div>
    </div>
  );
}
