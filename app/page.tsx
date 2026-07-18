import Link from "next/link";
import { Check } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";

// UT: "너무 설명적이다"(묵찬) · "3개 3개 3개 형식이 너무 많아, 불필요한 듯"(재갈) ·
// "이거 설명인가요?"(이려원) — 3장짜리 카드 섹션이 셋이나 겹쳐 페이지가 설명서로 읽혔다.
// 문제를 카드로 늘어놓던 섹션(PAINPOINTS)과 후기 섹션은 걷어내고, 남길 것만 남긴다.
//
// AI 붙여넣기 항목도 뺐다 — 아직 구현되지 않은 기능이라 랜딩에 걸어두면 없는 걸 약속하게 된다.
// 번호(01·02·03)도 지웠다. 순서가 있는 절차가 아니라 나란한 특징이라 숫자가 뜻하는 게 없었다.
const GUIDE_POINTS = [
  {
    title: "백지 대신 질문지",
    description: (
      <>
        무엇을 써야 할지 고민할 필요 없이, 준비된 항목을 채우면 이력서가 완성돼요.{" "}
        <span className="text-neutral-800 font-bold">필수 항목만 채우면 3분이면 끝나요.</span>
      </>
    ),
    fine: "작업 파트 → 대표 그림 → 장르 → 근무조건",
  },
  {
    title: "구인자가 보는 순서 그대로",
    description:
      "현직 작가·프리랜서에게 '가장 먼저 확인하는 게 뭐냐'고 직접 물었어요. 답변에 나온 순서 그대로 폼을 짰어요.",
    fine: "공정 → 그림 → 장르 → 근무조건",
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* I-2 히어로 */}
      <section
        className="pt-20 pb-16 md:pt-28 md:pb-24"
        style={{ background: "linear-gradient(180deg, var(--color-primary-50) 0%, #FFF9F5 42%, var(--color-neutral-0) 100%)" }}
      >
        <div className="max-w-[1160px] mx-auto px-5 md:px-10 grid md:grid-cols-[1.05fr_0.95fr] gap-14 md:gap-[56px] items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center bg-white border border-neutral-200 shadow-sm text-body-sm px-4 py-1.5 rounded-pill">
              그림 프리랜서 구인구직 플랫폼&nbsp;<span className="text-primary-500 font-extrabold">그리드로</span>
            </span>

            {/* UT: 3명이 이 페이지를 "가이드/설명 사이트"로 읽었는데, h1이 스스로를 '구직 가이드'라고
                말하고 있었다. 여기서 만드는 것이 무엇인지(이력서)와 얼마나 걸리는지를 그대로 적는다. */}
            <h1 className="text-hero text-neutral-900">
              <span className="text-primary-500">그림 프리랜서</span>를 위한
              <br />
              구직 이력서, 3분이면 끝나요.
            </h1>

            {/* "27명"은 재갈이 "너무 적어 보여"라고 했고, 묵찬은 "인원수보다 직업을 보여주는 게
                훨씬 와닿을 것"이라고 했다 — 숫자를 빼면 두 지적이 같이 풀린다. */}
            <p className="text-[17px] leading-[1.6] text-neutral-500">
              뭘 써야 할지 고민하지 마세요. <span className="text-neutral-800 font-bold">빈칸만 채우면 완성돼요.</span>
              <br />
              현직 작가·프리랜서에게 직접 물어본 순서 그대로 정리해뒀어요.
            </p>

            <div className="flex items-center gap-5 flex-wrap">
              <Button
                href="/write?entry=cta_hero"
                variant="dark-pill"
                arrow
                className="hover:-translate-y-0.5 hover:shadow-btn"
              >
                구직 하러가기
              </Button>
              <Link href="/feed" className="text-body-sm text-neutral-600 underline underline-offset-4 hover:text-neutral-900">
                먼저 둘러볼게요
              </Link>
            </div>

          </div>

          {/* AJ-3: 실제 ProgressChecklist(components/ui/ProgressChecklist.tsx)의 축약판.
              실제 완성도 카드 레이아웃·필수 항목명이 바뀌면 이 데모도 함께 갱신할 것. */}
          <div className="group relative">
            <div
              className="bg-white border border-neutral-200 rounded-lg shadow-md p-5 rotate-[-1deg] transition-transform duration-[.4s] ease-[cubic-bezier(.22,.61,.36,1)] group-hover:rotate-0 group-hover:-translate-y-1.5 group-hover:shadow-lg"
            >
              <div className="flex items-center justify-between text-body-sm mb-3">
                <span className="font-medium text-neutral-800">완성도</span>
                <span className="text-h3 font-bold text-neutral-900">75%</span>
              </div>
              <div className="w-full h-[6px] rounded-pill bg-neutral-100 overflow-hidden mb-4">
                <div className="h-full bg-primary-500" style={{ width: "75%" }} />
              </div>
              <div className="space-y-3">
                {["작업 파트", "대표 그림", "선호 장르"].map((label) => (
                  <div key={label} className="flex items-center gap-2">
                    <Check size={16} className="text-primary-500 shrink-0" />
                    <span className="text-body-sm text-neutral-700">{label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-neutral-300 shrink-0" />
                  <span className="text-body-sm text-neutral-700">근무형태</span>
                </div>
                <div className="bg-primary-50 rounded-md px-3 py-2 ml-6">
                  <p className="text-[13px] text-primary-700">채색 전·후 비교컷이 있으면 실력이 한눈에 보여요</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* I-4 이 서비스가 다르게 하는 것 */}
      <section className="bg-white border-t border-neutral-200 py-[76px] md:py-[112px]">
        <div className="max-w-[1160px] mx-auto px-5 md:px-10">
          <ScrollReveal>
            <PageHeader title="두 가지만 바꿨어요." lead="막막한 백지 대신, 채우면 되는 질문지로." />
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {GUIDE_POINTS.map((point, i) => (
              <ScrollReveal key={point.title} delayMs={i * 90}>
                <div className="h-full bg-white border border-neutral-200 rounded-lg px-8 py-7 flex flex-col">
                  <h3 className="text-h3 font-bold text-neutral-900">{point.title}</h3>
                  <p className="text-body leading-[1.72] text-neutral-500 mt-2">{point.description}</p>
                  <div className="mt-auto pt-5">
                    <div className="border-t border-dashed border-neutral-200 pt-3">
                      <p className="text-caption font-semibold text-neutral-400">{point.fine}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* I-5 작성 != 공개 (AJ-2: 실제 이력서 카드 상태 3단계 — 설명용 정적 UI, 실제 동작 없음) */}
      <section className="bg-neutral-900 py-[76px] md:py-[112px]">
        <div className="max-w-[1160px] mx-auto px-5 md:px-10 grid md:grid-cols-2 gap-12 md:gap-[64px] items-center">
          <ScrollReveal>
            <h2 className="text-[25px] md:text-h2 font-extrabold tracking-[-0.03em] text-white">
              써두는 것과 공개하는 것은
              <br />
              다른 일이에요.
            </h2>
            <p className="text-body leading-[1.75] text-neutral-400 mt-3">
              올리기 전까지 나만 보고, 올린 뒤에도 끌올 한 번이면 다시 맨 위로.
            </p>
          </ScrollReveal>

          <ScrollReveal delayMs={90}>
            <div className="flex flex-col gap-4">
              <div
                className="flex items-center justify-between gap-4 rounded-md px-5 py-4 border transition-colors duration-[.18s] hover:translate-x-1"
                style={{ background: "#1F1F1F", borderColor: "#2E2E2E" }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-bold text-white">임시 저장</p>
                    <Badge variant="neutral">비공개</Badge>
                  </div>
                  <p className="text-caption text-neutral-400 mt-1">필수 항목을 다 안 채워도 저장돼요</p>
                </div>
              </div>

              <div
                className="flex items-center justify-between gap-4 rounded-md px-5 py-4 border transition-colors duration-[.18s] hover:translate-x-1"
                style={{ background: "#1F1F1F", borderColor: "#2E2E2E" }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-bold text-white">구직란에 올리기</p>
                    <Badge variant="primary">공개 중</Badge>
                  </div>
                  <p className="text-caption text-neutral-400 mt-1">구인자에게 카드로 노출돼요</p>
                </div>
              </div>

              <div
                className="flex items-center justify-between gap-4 rounded-md px-5 py-4 border transition-colors duration-[.18s] hover:translate-x-1"
                style={{ background: "#1F1F1F", borderColor: "#2E2E2E" }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm font-medium text-white bg-primary-500 px-3 py-1.5 rounded-pill">끌올</span>
                  </div>
                  <p className="text-caption text-neutral-400 mt-1">48시간마다 한 번, 피드 맨 위로 올라가요</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 후기 섹션은 걷어냈다. 실제 UT 전에 만든 예시 문장에 별점까지 붙어 있어, 그대로 두면
          아무도 한 적 없는 말을 후기로 내보내게 된다. 실제 발언을 쓰려면 당사자 동의가 먼저다. */}

      {/* I-7 최종 CTA (가운데 정렬 허용 섹션) */}
      <section
        className="py-[76px] md:py-[112px]"
        style={{ background: "linear-gradient(180deg, var(--color-neutral-0), var(--color-primary-50))" }}
      >
        <div className="max-w-[1160px] mx-auto px-5 md:px-10">
          <ScrollReveal>
            <PageHeader
              align="center"
              title={<span className="text-[36px]">3분이면, 컨택받을 준비가 끝나요.</span>}
              lead="지금 쓰고, 올리는 건 나중에 정해도 괜찮아요."
            />
            <div className="flex flex-col items-center gap-3 mt-8">
              <Button
                href="/write?entry=cta_hero"
                variant="dark-pill"
                size="lg"
                arrow
                className="hover:-translate-y-0.5 hover:shadow-btn"
              >
                구직 하러가기
              </Button>
              <p className="text-caption text-neutral-400">회원가입 없이 먼저 둘러볼 수 있어요</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* I-8 푸터 */}
      <footer className="bg-white border-t border-neutral-200 py-10">
        <div className="max-w-[1160px] mx-auto px-5 md:px-10 flex items-center justify-between flex-wrap gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg?v=3" alt="GRIDRO" className="h-4 w-auto" />
          <span className="text-body-sm text-neutral-400">그림 프리랜서 구인구직 플랫폼 · 2026</span>
        </div>
      </footer>
    </div>
  );
}
