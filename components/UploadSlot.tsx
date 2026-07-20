"use client";

import { useRef, useState } from "react";
import { UploadCloud, Lightbulb } from "lucide-react";
import { fileToImageUrl } from "@/lib/resizeImage";
import { useToast } from "@/components/ui/Toast";
import { track } from "@/lib/mixpanel";

const MAX_IMAGES = 10;

export interface UploadTip {
  part: string;
  tip: string;
}

interface UploadSlotProps {
  images: string[];
  onChange: (next: string[]) => void;
  /** 대표 이미지 인덱스 — 순서와 독립적으로 관리 */
  coverIndex: number;
  onCoverIndexChange: (index: number) => void;
  /** 이미지별 캡션 */
  captions: string[];
  onCaptionsChange: (captions: string[]) => void;
  tips?: UploadTip[];
  label: string;
  required?: boolean;
}

export default function UploadSlot({
  images,
  onChange,
  coverIndex,
  onCoverIndexChange,
  captions,
  onCaptionsChange,
  tips = [],
  label,
  required,
}: UploadSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const toast = useToast();

  const isFull = images.length >= MAX_IMAGES;

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const room = MAX_IMAGES - images.length;
    const accepted = files.slice(0, room);
    // 리사이즈에 시간이 걸려 완료 시점이 눈에 안 띄므로 결과를 토스트로 알린다.
    if (files.length > accepted.length) {
      toast.show(`최대 ${MAX_IMAGES}장까지 올릴 수 있어 나머지는 제외했어요`, "danger");
    }
    if (accepted.length === 0) return;
    const urls = await Promise.all(accepted.map(fileToImageUrl));
    onChange([...images, ...urls]);
    // 새 이미지에 빈 캡션 추가
    onCaptionsChange([...captions, ...urls.map(() => "")]);
    track("image_uploaded", { count: urls.length, is_first: images.length === 0 });
    toast.show(`그림 ${urls.length}장을 올렸어요`);
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
    onCaptionsChange(captions.filter((_, i) => i !== index));
    // coverIndex 보정: 삭제된 이미지가 대표였거나 대표보다 앞이면 조정
    if (index === coverIndex) {
      onCoverIndexChange(0);
    } else if (index < coverIndex) {
      onCoverIndexChange(coverIndex - 1);
    }
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const nextImages = [...images];
    const [movedImg] = nextImages.splice(from, 1);
    nextImages.splice(to, 0, movedImg);
    onChange(nextImages);

    const nextCaptions = [...captions];
    const [movedCap] = nextCaptions.splice(from, 1);
    nextCaptions.splice(to, 0, movedCap);
    onCaptionsChange(nextCaptions);

    // coverIndex도 이동에 맞춰 갱신
    let newCover = coverIndex;
    if (from === coverIndex) {
      newCover = to;
    } else {
      if (from < coverIndex && to >= coverIndex) newCover--;
      else if (from > coverIndex && to <= coverIndex) newCover++;
    }
    if (newCover !== coverIndex) onCoverIndexChange(newCover);
  };

  const updateCaption = (index: number, value: string) => {
    const next = [...captions];
    next[index] = value;
    onCaptionsChange(next);
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
      {/* AQ-1: 성인물 업로드 금지 안내 — isFull 여부와 무관하게 항상 노출 */}
      <p className="text-caption text-neutral-400">성인 콘텐츠(19금)는 업로드할 수 없어요.</p>

      {images.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-5 gap-3">
            {images.map((url, index) => (
              <div key={`${url}-${index}`} className="space-y-1.5">
                <div
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
                  {index === coverIndex ? (
                    <span className="absolute bottom-1 left-1 text-caption px-1.5 py-0.5 rounded-sm bg-primary-500 text-white">
                      대표
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onCoverIndexChange(index)}
                      className="absolute bottom-0 left-0 right-0 py-1 text-caption font-medium bg-black/60 text-white transition-colors hover:bg-black/80"
                    >
                      대표로 지정
                    </button>
                  )}
                </div>
                {/* 이미지별 캡션 입력 */}
                <input
                  type="text"
                  value={captions[index] ?? ""}
                  onChange={(e) => updateCaption(index, e.target.value)}
                  placeholder="예) 「작품명」 채색"
                  className="w-full text-caption text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 outline-none focus:border-primary-400 transition-colors"
                  maxLength={40}
                />
              </div>
            ))}
          </div>
          {images.length > 1 && <p className="text-caption text-neutral-400">끌어서 순서를 바꿀 수 있어요</p>}
        </div>
      )}
    </div>
  );
}
