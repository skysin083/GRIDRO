"use client";

import { useRef, useState } from "react";
import { fileToImageUrl } from "@/lib/resizeImage";

const MAX_IMAGES = 10;

interface UploadSlotProps {
  images: string[];
  onChange: (next: string[]) => void;
  tip?: string;
}

export default function UploadSlot({ images, onChange, tip }: UploadSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    const url = await fileToImageUrl(file);
    onChange([...images, url]);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const slots = Array.from({ length: MAX_IMAGES });

  return (
    <div className="space-y-2">
      {tip && <p className="text-caption text-info bg-info/10 rounded-md px-3 py-2">{tip}</p>}
      <div className="grid grid-cols-5 gap-2">
        {slots.map((_, index) => {
          const url = images[index];
          if (url) {
            return (
              <div key={index} className="group relative aspect-[3/4] rounded-md overflow-hidden bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`대표 그림 ${index + 1}`} className="w-full h-full object-cover object-top" />
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs leading-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="이미지 삭제"
                >
                  ×
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 text-caption px-1.5 py-0.5 rounded-sm bg-primary-500 text-white">
                    대표
                  </span>
                )}
              </div>
            );
          }
          const isNextEmpty = index === images.length;
          return (
            <button
              key={index}
              type="button"
              disabled={!isNextEmpty}
              onClick={() => isNextEmpty && inputRef.current?.click()}
              onDragOver={(e) => {
                if (!isNextEmpty) return;
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => isNextEmpty && setDragActive(false)}
              onDrop={isNextEmpty ? handleDrop : undefined}
              className={`aspect-[3/4] rounded-md border flex items-center justify-center text-body-sm transition-colors duration-[.25s] ${
                isNextEmpty
                  ? dragActive
                    ? "border-primary-500 border-solid bg-primary-50 text-primary-500 cursor-pointer"
                    : "border-neutral-300 border-dashed bg-neutral-50 text-neutral-400 hover:border-primary-300 hover:bg-primary-50 cursor-pointer"
                  : "border-neutral-100 border-dashed text-neutral-200 cursor-not-allowed"
              }`}
            >
              +
            </button>
          );
        })}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleInputChange} />
      </div>
    </div>
  );
}
