"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Modal from "@/components/ui/Modal";

const CHECKLIST = ["금액(MG/RS)", "마감기한", "테스트 여부", "작업예상일"];

export default function ContactModal({ email, onClose }: { email: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-title font-semibold text-neutral-900">컨택하기</h2>

      <div className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2.5">
        <span className="text-body-sm text-neutral-800">{email}</span>
        <button
          type="button"
          onClick={handleCopy}
          className={`text-body-sm font-medium underline underline-offset-4 transition-colors ${
            copied ? "text-primary-500" : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          {copied ? "복사했어요" : "복사"}
        </button>
      </div>
      <p className="text-[13px] text-neutral-400">컨택하기를 눌렀을 때만 공개되는 이메일이에요</p>

      <div className="space-y-2">
        <p className="text-body-sm font-semibold text-neutral-800">컨택 시 함께 알려주세요</p>
        <ul className="space-y-1.5">
          {CHECKLIST.map((item) => (
            <li key={item} className="text-[15px] leading-[1.7] text-neutral-600 flex items-center gap-2">
              <Check size={14} className="text-primary-500 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
