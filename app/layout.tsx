import type { Metadata } from "next";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "그리드로 — 그림 프리랜서 구직 플랫폼",
  description: "그림 중심 이력서를 만들고 원할 때 공유하는 그림 프리랜서 구인구직 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-0">
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
