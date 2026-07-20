import PageHeader from "@/components/ui/PageHeader";

const FEEDBACK_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdSwJGKrL3EPtypo_AZP2QOpiycC9Lx_G6bFC74jFiDWcfIBg/viewform?usp=header";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-body font-bold text-neutral-900">{title}</h3>
      <div className="text-body-sm leading-[1.75] text-neutral-600 space-y-2">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="max-w-[720px] mx-auto px-5 md:px-10 py-14 space-y-10">
      <PageHeader title="이용약관" lead="그리드로를 이용하시기 전 아래 내용을 확인해주세요." />

      <div className="space-y-8">
        <Section title="1. 서비스 목적">
          <p>그리드로(GRIDRO)는 그림 프리랜서가 이력서를 작성하고, 원할 때 공개해 구인자와 연결될 수 있도록 돕는 플랫폼입니다.</p>
        </Section>

        <Section title="2. 업로드 콘텐츠에 대한 책임">
          <p>이력서에 업로드하는 이미지·텍스트 등 콘텐츠(이하 &lsquo;업로드 콘텐츠&rsquo;)의 저작권 및 적법성에 대한 책임은 업로드한 이용자 본인에게 있습니다. 타인의 저작물을 무단으로 업로드해서는 안 됩니다.</p>
        </Section>

        <Section title="3. 금지 콘텐츠">
          <ul className="list-disc list-inside space-y-1.5">
            <li>선정적·폭력적이거나 법령을 위반하는 콘텐츠, 타인의 권리를 침해하는 콘텐츠는 업로드할 수 없습니다.</li>
            {/* AQ-2: 성인물(19금) 업로드 명시 금지 조항 */}
            <li>이용자는 성인 콘텐츠(선정적·폭력적 표현을 포함한 19금 콘텐츠)를 업로드할 수 없습니다.</li>
            <li>위반 콘텐츠는 사전 고지 없이 삭제될 수 있으며, 반복 위반 시 이용이 제한될 수 있습니다.</li>
            <li>신고는 [의견 보내기] 채널을 통해 접수합니다.</li>
          </ul>
        </Section>

        <Section title="4. 신고 및 삭제 요청">
          <p>
            저작권 침해나 부적절한 콘텐츠를 발견하시면{" "}
            <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">
              문의 채널
            </a>
            로 신고해주세요. 확인 후 신속히 처리합니다.
          </p>
        </Section>

        <Section title="5. 서비스 제공자의 책임 범위">
          <p>그리드로는 이용자가 업로드한 콘텐츠의 내용에 대해 사전 검수를 하지 않으며, 그로 인해 발생하는 법적 책임은 해당 콘텐츠를 업로드한 이용자에게 있습니다. 신고 접수 시에는 관련 콘텐츠를 지체 없이 조치합니다.</p>
        </Section>

        <Section title="6. 서비스 이용 제한">
          <p>현재 그리드로는 텍스트로 작성한 이력서 정보만을 다루며, 업로드된 이미지 자체의 내용을 자동으로 분석하지 않습니다. 이미지 내용에 대한 검증은 신고 기반으로 이루어집니다.</p>
        </Section>

        <p className="text-caption text-neutral-400 pt-4 border-t border-neutral-200">시행일: 2026.07.19</p>
      </div>
    </div>
  );
}
