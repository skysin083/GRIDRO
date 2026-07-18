import type { Metadata } from "next";
import Header from "@/components/Header";
import { ToastProvider } from "@/components/ui/Toast";
import AuthListener from "@/components/AuthListener";
import AnalyticsListener from "@/components/AnalyticsListener";
import "./globals.css";

const TITLE = "그리드로 — 그림 프리랜서 구직 플랫폼";
const DESCRIPTION = "그림 중심 이력서를 만들고 원할 때 공유하는 그림 프리랜서 구인구직 플랫폼";

export const metadata: Metadata = {
  // 카카오톡/슬랙 등에 공유했을 때 뜨는 썸네일(app/opengraph-image.tsx)의 상대 경로를 절대
  // URL로 해석하려면 metadataBase가 필요하다 — 없으면 Next가 빌드 경고를 내고, 일부
  // 공유 서비스는 상대 경로 이미지를 아예 못 읽는다.
  metadataBase: new URL("https://gridro.vercel.app"),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "그리드로",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-0">
        <ToastProvider>
          <AuthListener />
          <AnalyticsListener />
          <Header />
          <main className="flex-1">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
