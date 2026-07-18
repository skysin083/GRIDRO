"use client";

import { useState } from "react";
import { Sparkle } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { track } from "@/lib/mixpanel";

// 실제 AI 파싱은 아직 연결 전이다. 예전엔 버튼을 누르면 가짜로 1.2초 로딩만 보여주고 폼은
// 그대로 빈 채로 돌아갔는데, 이건 "붙여넣고 기다렸는데 아무 일도 안 일어남"으로 보여
// 기능이 없는 것보다 나빴다. 탭 자체(그리고 이 입력창)는 "이런 게 생길 예정"이라는 걸
// 미리 보여주는 용도로 남겨두고, 실제 클릭했을 땐 준비 중임을 정직하게 알린다.
export default function AiPasteSection({}: { onComplete?: () => void }) {
  const [text, setText] = useState("");
  const toast = useToast();

  const handleClick = () => {
    track("ai_paste_used", { text_length: text.length });
    toast.show("아직 준비 중인 기능이에요", "info");
  };

  return (
    <div className="bg-primary-50 border border-primary-200 rounded-md p-6 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkle size={18} className="text-primary-500" fill="currentColor" />
        <h3 className="text-title font-bold text-neutral-900">AI로 이력서 자동 정리</h3>
        <span className="text-caption font-medium text-primary-600 bg-white border border-primary-200 rounded-pill px-2 py-0.5">
          준비 중
        </span>
      </div>
      <p className="text-body-sm text-neutral-600">
        방사 카페 등에 써둔 글을 붙여넣으면 항목별로 나눠 담아드릴 예정이에요. 곧 만나보실 수 있어요.
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
        <Button variant="primary" disabled={text.trim().length < 10} onClick={handleClick}>
          AI로 정리하기
        </Button>
        <p className="text-caption text-neutral-400">지금은 왼쪽의 &lsquo;처음부터 작성&rsquo;으로 이용해주세요</p>
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
