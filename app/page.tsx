import Link from "next/link";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";

const PAINPOINTS = [
  {
    // AJ-1: 플레이스홀더 — 인터뷰 원문 대조 후 최종 문장 확정 필요
    quote: "그림은 자신 있는데, 방사 카페에 구직글만 쓰려고 하면 뭘 어떻게 써야 할지 막막하더라고요.",
    source: "인터뷰 · 어시 2년차",
  },
  {
    quote: "남의 글을 베껴 쓰다 보니 정작 제 강점은 하나도 안 들어갔어요.",
    source: "설문 · 어시 1년차",
  },
  {
    quote: "형식·항목이 다 달라서, 뭘 먼저 봐야 할지도 모르겠더라고요.",
    source: "인터뷰 · 구인자",
  },
];

const GUIDE_POINTS = [
  {
    number: "01",
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
    number: "02",
    title: "구인자가 보는 순서 그대로",
    description: "구인자 27명에게 '가장 먼저 확인하는 게 뭐냐'고 직접 물었어요. 답변에 나온 순서 그대로 폼을 짰어요.",
    fine: "공정 → 그림 → 장르 → 근무조건",
  },
  {
    number: "03",
    title: "이미 쓴 글이 있다면 붙여넣기",
    description: (
      <>
        <span className="text-neutral-800 font-bold">폼에 들어가서 &apos;붙여넣고 시작&apos;을 누르면</span>, 방사 카페 등에
        써둔 구직글을 AI가 항목별로 나눠 담아요. 채워진 내용은 언제든 직접 고칠 수 있어요.
      </>
    ),
    fine: "글만 읽어요. 그림은 분석하지 않아요.",
  },
];

const UT_REVIEWS = [
  {
    quote: "순서대로 채우기만 했는데 방사 카페에 올렸던 글보다 훨씬 정리돼 보였어요. 3분도 안 걸렸어요.",
    source: "UT 참여자 · 어시 2년차",
  },
  {
    quote: "뭘 강조해야 할지 몰랐는데, 질문에 답하다 보니 제 강점이 저절로 정리됐어요.",
    source: "UT 참여자 · 어시 1년차",
  },
  {
    quote: "올리기 전에 미리 볼 수 있어서 부담 없이 끝까지 채울 수 있었어요.",
    source: "UT 참여자 · 어시 3년차",
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

            <h1 className="text-hero text-neutral-900">
              <span className="text-primary-500">그림 프리랜서</span>를 위한
              <br />
              구직 가이드를 준비했어요.
            </h1>

            <p className="text-[17px] leading-[1.6] text-neutral-500">
              뭘 써야 할지 고민하지 마세요. <span className="text-neutral-800 font-bold">빈칸만 채우면 이력서가 완성돼요.</span>
              <br />
              구인자 27명에게 직접 물어본 순서 그대로 정리해뒀어요.
            </p>

            <div className="flex items-center gap-5 flex-wrap">
              <Button href="/write" variant="dark-pill" arrow className="hover:-translate-y-0.5 hover:shadow-btn">
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

      {/* I-3 페인포인트 */}
      <section className="bg-neutral-50 border-y border-neutral-200 py-[76px] md:py-[112px]">
        <div className="max-w-[1160px] mx-auto px-5 md:px-10">
          <ScrollReveal>
            <PageHeader
              title="실력이 아니라, 쓰는 방법이 막혔던 거예요."
              lead="그림도, 이력도 이미 있어요. 정리할 방법만 없었을 뿐이에요."
            />
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
            {PAINPOINTS.map((p, i) => (
              <ScrollReveal key={p.source} delayMs={i * 90}>
                <div className="group h-full bg-white border border-neutral-200 rounded-lg px-6 py-[26px]">
                  <span className="block text-[26px] font-extrabold text-primary-200 transition-colors duration-[.18s] group-hover:text-primary-400">
                    &ldquo;
                  </span>
                  <p className="text-left text-[16px] leading-[1.7] text-neutral-700 mt-2">{p.quote}</p>
                  <p className="text-caption font-bold text-neutral-400 mt-4">{p.source}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <p className="text-body-sm font-semibold text-neutral-400 text-center mt-10">
            설문 구직자 66명 · 구인자 27명 / 심층 인터뷰 6명
          </p>
        </div>
      </section>

      {/* I-4 구직 가이드 3포인트 */}
      <section className="bg-white py-[76px] md:py-[112px]">
        <div className="max-w-[1160px] mx-auto px-5 md:px-10">
          <ScrollReveal>
            <PageHeader title="세 가지만 바꿨어요." lead="막막한 백지 대신, 채우면 되는 질문지로." />
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {GUIDE_POINTS.map((point, i) => (
              <ScrollReveal key={point.title} delayMs={i * 90}>
                <div className="h-full bg-white border border-neutral-200 rounded-lg px-8 py-7 flex flex-col">
                  <span className="inline-flex w-fit text-caption font-extrabold text-primary-500 bg-primary-50 rounded-sm px-2 py-1">
                    {point.number}
                  </span>
                  <h3 className="text-h3 font-bold text-neutral-900 mt-4">{point.title}</h3>
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

      {/* I-6 UT 후기 */}
      <section className="bg-neutral-50 py-[76px] md:py-[112px]">
        <div className="max-w-[1160px] mx-auto px-5 md:px-10">
          <ScrollReveal>
            <PageHeader
              title="먼저 써본 분들의 이야기"
              lead="그림 프리랜서 6명과 함께 작성 과정을 테스트했어요."
            />
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {UT_REVIEWS.map((review, i) => (
              <ScrollReveal key={review.source} delayMs={i * 90}>
                <div className="h-full bg-white border border-neutral-200 rounded-lg px-6 py-6">
                  <p className="text-primary-400 text-[13px] tracking-[2px]">★★★★★</p>
                  <p className="text-body leading-[1.75] text-neutral-700 mt-3">{review.quote}</p>
                  <div className="border-t border-neutral-200 mt-4 pt-3">
                    <p className="text-caption font-bold text-neutral-400">{review.source}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

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
              <Button href="/write" variant="dark-pill" size="lg" arrow className="hover:-translate-y-0.5 hover:shadow-btn">
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
          <span className="text-[16px] font-bold text-primary-500">GRIDRO</span>
          <span className="text-body-sm text-neutral-400">그림 프리랜서 구인구직 플랫폼 · 2026</span>
        </div>
      </footer>
    </div>
  );
}
