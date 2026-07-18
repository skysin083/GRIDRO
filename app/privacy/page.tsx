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

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-[720px] mx-auto px-5 md:px-10 py-14 space-y-10">
      <PageHeader title="개인정보처리방침" lead="그리드로가 어떤 정보를 어떻게 다루는지 알려드려요." />

      <div className="space-y-8">
        <Section title="1. 수집하는 개인정보 항목">
          <p>Google 로그인 시 이메일 주소를 제공받습니다. 이력서 작성 과정에서 닉네임, 프로필 이미지, 경력사항, 연락 가능 시간 등 이용자가 직접 입력한 정보를 수집합니다.</p>
        </Section>

        <Section title="2. 수집 목적">
          <p>회원 식별 및 로그인, 이력서 작성·공개, 구인구직 매칭(구직란 노출) 목적으로만 사용합니다. 이 외의 목적으로 이용하지 않습니다.</p>
        </Section>

        <Section title="3. 보유 및 이용 기간">
          <p>회원 탈퇴 또는 삭제 요청 시까지 보관하며, 요청 즉시 지체 없이 파기합니다. 현재는 자동 탈퇴 기능을 제공하지 않아 아래 문의 채널로 요청해주시면 처리해드립니다.</p>
        </Section>

        <Section title="4. 제3자 제공">
          <p>이용자의 개인정보를 외부에 제공하지 않습니다. 다만 이력서를 &lsquo;공개&rsquo; 상태로 전환하면 닉네임, 프로필 이미지, 경력 등 이력서에 포함된 정보가 구직란을 통해 다른 방문자에게 노출됩니다. 비공개로 전환하면 즉시 노출이 중단됩니다.</p>
        </Section>

        <Section title="5. 이미지 처리">
          <p>업로드한 이미지는 Supabase Storage에 저장되며, 이력서를 삭제하거나 이미지를 교체하면 삭제를 요청할 수 있습니다. 업로드 과정에서 원본 파일의 촬영 위치·시간 등 메타데이터(EXIF)가 제거될 수 있습니다.</p>
        </Section>

        <Section title="6. 문의처">
          <p>
            개인정보 열람·정정·삭제 요청 등 문의사항은{" "}
            <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">
              문의 채널
            </a>
            을 통해 접수해주세요.
          </p>
        </Section>

        <p className="text-caption text-neutral-400 pt-4 border-t border-neutral-200">시행일: 2026.07.19</p>
      </div>
    </div>
  );
}
