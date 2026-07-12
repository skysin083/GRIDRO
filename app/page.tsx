import Link from "next/link";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";

const PAINPOINTS = [
  {
    quote: (
      <>
        분명 실력은 있는데, 방사 카페 구직글에 뭘 어떻게 써야
        <br />
        컨택으로 이어질지 모르겠어요.
      </>
    ),
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
    description: "필수 4개, 3분",
    fine: "공정 · 대표 그림 · 장르 · 근무조건",
  },
  {
    number: "02",
    title: "구인자가 보는 순서 그대로",
    description: "구인자 19명에게 직접 물어본 순서",
    fine: "공정 → 그림 → 장르 → 근무조건",
  },
  {
    number: "03",
    title: "이미 쓴 글이 있다면 붙여넣기",
    description: "방사 카페 등에 써둔 글을 붙여넣으면 AI가 항목별로 나눠 담아요.",
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

            <p className="text-[17px] leading-[1.72] text-neutral-500">
              뭘 써야 할지 고민하지 마세요. <span className="text-neutral-800 font-bold">빈칸만 채우면 구직글이 완성돼요.</span>
              <br />
              구인자 19명에게 직접 물어본 순서 그대로 정리해뒀어요.
            </p>

            <div className="flex items-center gap-5 flex-wrap">
              <Button href="/write" variant="dark-pill" arrow>
                구직 하러가기
              </Button>
              <Link href="/feed" className="text-body-sm text-neutral-600 underline underline-offset-4 hover:text-neutral-900">
                먼저 둘러볼게요
              </Link>
            </div>

            <div className="border-t border-neutral-200 pt-5 flex flex-wrap gap-x-6 gap-y-2">
              {["작성 3분", "회원가입 없이 둘러보기", "올리기 전까지 비공개"].map((item) => (
                <span key={item} className="text-body-sm text-neutral-500 flex items-center gap-2">
                  <span className="w-[5px] h-[5px] rounded-full bg-primary-300" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="group relative">
            <div
              className="bg-white border border-neutral-200 rounded-lg p-5 rotate-[-1.2deg] transition-transform duration-[.4s] ease-[cubic-bezier(.22,.61,.36,1)] group-hover:rotate-[-1.8deg] group-hover:-translate-y-1"
            >
              <p className="text-[11px] font-bold text-neutral-400 tracking-[.06em] mb-2">이미 써둔 구직글</p>
              <p className="text-body-sm leading-[1.75] text-neutral-500">
                안녕하세요 채색 어시 구합니다 저는 로맨스 드라마 위주로 작업했고 클스페 포토샵 둘 다 다룰 줄 알아요 마감
                잘 지키고 연락도 잘 되는 편입니다 포폴은 댓글로 문의주세요...
              </p>
            </div>

            <div className="flex items-center gap-3 my-4">
              <span className="flex-1 h-px bg-gradient-to-r from-transparent to-primary-300" />
              <span className="text-caption font-bold text-primary-600 shrink-0">— AI가 정리해요 —</span>
              <span className="flex-1 h-px bg-gradient-to-l from-transparent to-primary-300" />
            </div>

            <div
              className="bg-white border border-neutral-200 rounded-lg shadow-md p-4 rotate-[.8deg] transition-transform duration-[.4s] ease-[cubic-bezier(.22,.61,.36,1)] group-hover:rotate-0 group-hover:-translate-y-1.5 group-hover:shadow-lg"
            >
              <div className="flex gap-3 items-start">
                <div className="w-[52px] h-[68px] rounded-[10px] bg-neutral-100 overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/dummy-images/gujik-yeona-0.svg" alt="" className="w-full h-full object-cover object-top" />
                </div>
                <div className="min-w-0 space-y-1 pt-1">
                  <p className="text-body-sm font-semibold text-neutral-900">연아</p>
                  <p className="text-body-sm text-neutral-600 line-clamp-1">잔잔한 감성 로맨스 채색을 가장 잘합니다.</p>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    <span className="text-caption px-1.5 py-0.5 rounded-sm bg-primary-50 text-primary-700">채색</span>
                    <span className="text-caption px-1.5 py-0.5 rounded-sm bg-neutral-100 text-neutral-600">로맨스</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-neutral-100">
                <span
                  className="inline-flex text-caption font-medium px-2 py-0.5 rounded-pill"
                  style={{ background: "#EFF6FF", color: "#2563EB" }}
                >
                  AI 자동 입력 · 수정할 수 있어요
                </span>
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
              eyebrow="WHY GRIDRO"
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
                  <p className="text-[16px] leading-[1.7] text-neutral-700 mt-2">{p.quote}</p>
                  <p className="text-caption font-bold text-neutral-400 mt-4">{p.source}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <p className="text-body-sm font-semibold text-neutral-400 text-center mt-10">
            설문 구직자 56명 · 구인자 19명 / 심층 인터뷰 6명
          </p>
        </div>
      </section>

      {/* I-4 구직 가이드 3포인트 */}
      <section className="bg-white py-[76px] md:py-[112px]">
        <div className="max-w-[1160px] mx-auto px-5 md:px-10">
          <ScrollReveal>
            <PageHeader eyebrow="구직 가이드" title="세 가지만 바꿨어요." lead="막막한 백지 대신, 채우면 되는 질문지로." />
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

      {/* I-5 작성 != 공개 (정적 UI, 실제 토글 동작 없음) */}
      <section className="bg-neutral-900 py-[76px] md:py-[112px]">
        <div className="max-w-[1160px] mx-auto px-5 md:px-10 grid md:grid-cols-2 gap-12 md:gap-[64px] items-center">
          <ScrollReveal>
            <p className="text-eyebrow" style={{ color: "var(--color-primary-400)" }}>
              그리드로만의 방식
            </p>
            <h2 className="text-[25px] md:text-h2 font-extrabold tracking-[-0.03em] text-white mt-2">
              써두는 것과 공개하는 것은
              <br />
              다른 일이에요.
            </h2>
            <p className="text-body leading-[1.75] text-neutral-400 mt-3">
              올리기 전까지 나만 보고, 올리고 내리는 건 스위치 한 번.
            </p>
          </ScrollReveal>

          <ScrollReveal delayMs={90}>
            <div className="flex flex-col gap-4">
              <div
                className="flex items-center gap-4 rounded-md px-5 py-4 border transition-colors duration-[.18s] hover:translate-x-1"
                style={{ background: "#1F1F1F", borderColor: "#2E2E2E" }}
              >
                <span className="w-11 h-6 rounded-pill bg-neutral-600 relative shrink-0">
                  <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white" />
                </span>
                <div>
                  <p className="text-[15px] font-bold text-white">저장만 해두기</p>
                  <p className="text-caption text-neutral-400">이력서 탭에 비공개로 보관돼요</p>
                </div>
              </div>

              <div
                className="flex items-center gap-4 rounded-md px-5 py-4 border transition-colors duration-[.18s] hover:translate-x-1"
                style={{ background: "#1F1F1F", borderColor: "#2E2E2E" }}
              >
                <span className="w-11 h-6 rounded-pill bg-primary-500 relative shrink-0">
                  <span className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white" />
                </span>
                <div>
                  <p className="text-[15px] font-bold text-white">구직란에 올리기</p>
                  <p className="text-caption text-neutral-400">구인자에게 카드로 노출돼요</p>
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
              eyebrow="사용성 테스트"
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
              eyebrow="지금 시작하기"
              title={<span className="text-[36px]">3분이면, 컨택받을 준비가 끝나요.</span>}
              lead="지금 쓰고, 올리는 건 나중에 정해도 괜찮아요."
            />
            <div className="flex flex-col items-center gap-3 mt-8">
              <Button href="/write" variant="dark-pill" size="lg" arrow>
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
