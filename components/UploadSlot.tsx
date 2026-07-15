"use client";

import { useRef, useState } from "react";
import { UploadCloud, Lightbulb } from "lucide-react";
import { fileToImageUrl } from "@/lib/resizeImage";

const MAX_IMAGES = 10;

export interface UploadTip {
  part: string;
  tip: string;
}

interface UploadSlotProps {
  images: string[];
  onChange: (next: string[]) => void;
  tips?: UploadTip[];
  label: string;
  required?: boolean;
}

export default function UploadSlot({ images, onChange, tips = [], label, required }: UploadSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [overflowMsg, setOverflowMsg] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const isFull = images.length >= MAX_IMAGES;

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const room = MAX_IMAGES - images.length;
    const accepted = files.slice(0, room);
    if (files.length > accepted.length) {
      setOverflowMsg(true);
      setTimeout(() => setOverflowMsg(false), 3000);
    }
    if (accepted.length === 0) return;
    const urls = await Promise.all(accepted.map(fileToImageUrl));
    onChange([...images, ...urls]);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) await handleFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) await handleFiles(e.dataTransfer.files);
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const makeCover = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const [chosen] = next.splice(index, 1);
    next.unshift(chosen);
    onChange(next);
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-body-sm font-semibold text-neutral-800">
          {label}
          {required && <span className="text-danger">*</span>}
        </h3>
        <span
          className={`text-caption font-semibold px-1.5 py-0.5 rounded-sm ${
            isFull ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500"
          }`}
        >
          {images.length}/{MAX_IMAGES}
        </span>
      </div>

      {/* UT: bg-info/10 + caption 크기라 팁이 흐려서 5명 중 1명만 알아챘고, 파트 미선택 상태에서는
          아무것도 뜨지 않아 팁의 존재조차 알 수 없었다. 제목·아이콘·파트명을 붙여 먼저 읽히게 하고,
          미선택 상태에서도 자리를 남겨 "파트를 고르면 팁이 나온다"는 인과를 드러낸다. */}
      {tips.length > 0 ? (
        <div className="rounded-md border border-info/30 bg-info/10 px-3.5 py-3 space-y-2">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-info">
            <Lightbulb size={14} />
            이런 그림을 올리면 좋아요
          </p>
          <ul className="space-y-1.5">
            {tips.map(({ part, tip }) => (
              <li key={part} className="text-[13px] text-neutral-700 leading-relaxed">
                <span className="font-semibold text-info">{part}</span>
                <span className="text-neutral-400"> · </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-3.5 py-3">
          <p className="flex items-center gap-1.5 text-[13px] text-neutral-500">
            <Lightbulb size={14} className="text-neutral-400 shrink-0" />
            <span>
              위에서 <span className="font-semibold text-neutral-700">작업 파트</span>를 고르면, 어떤 그림을 올리면
              좋을지 알려드려요
            </span>
          </p>
        </div>
      )}

      {!isFull && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`h-[200px] rounded-lg border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors duration-[.25s] ${
            dragActive
              ? "border-primary-500 border-solid bg-primary-50"
              : "border-neutral-300 border-dashed bg-neutral-50 hover:border-primary-300 hover:bg-primary-50"
          }`}
        >
          <UploadCloud size={28} className="text-primary-300" />
          <p className="text-[15px] font-semibold text-neutral-600">여기로 이미지를 끌어오거나 클릭해서 올려주세요</p>
          <p className="text-[13px] text-neutral-400">JPG·PNG, 한 번에 여러 장 가능</p>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleInputChange} />
        </div>
      )}

      {overflowMsg && (
        <p className="text-caption text-danger">최대 {MAX_IMAGES}장까지 업로드할 수 있어 나머지는 제외됐어요.</p>
      )}

      {images.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-5 gap-3">
            {images.map((url, index) => (
              <div
                key={url}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndex !== null) reorder(dragIndex, index);
                  setDragIndex(null);
                }}
                onDragEnd={() => setDragIndex(null)}
                className={`group relative aspect-[3/4] rounded-md overflow-hidden bg-neutral-100 cursor-grab active:cursor-grabbing border-2 transition-all duration-[.18s] ${
                  dragIndex === index ? "opacity-30 border-primary-500 shadow-md scale-[1.02]" : "border-transparent"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`대표 그림 ${index + 1}`}
                  draggable={false}
                  className="w-full h-full object-cover object-top pointer-events-none"
                />
                {/* UT: 호버로만 노출한 탓에 '대표로 지정'을 찾는 데 병목이 생겼다.
                    터치 기기에는 hover가 없어 발견 자체가 불가능하므로 상시 노출한다. */}
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs leading-5 transition-colors hover:bg-black/80"
                  aria-label="이미지 삭제"
                >
                  ×
                </button>
                {index === 0 ? (
                  <span className="absolute bottom-1 left-1 text-caption px-1.5 py-0.5 rounded-sm bg-primary-500 text-white">
                    대표
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => makeCover(index)}
                    className="absolute bottom-0 left-0 right-0 py-1 text-caption font-medium bg-black/60 text-white transition-colors hover:bg-black/80"
                  >
                    대표로 지정
                  </button>
                )}
              </div>
            ))}
          </div>
          {images.length > 1 && <p className="text-caption text-neutral-400">끌어서 순서를 바꿀 수 있어요</p>}
        </div>
      )}
    </div>
  );
}
