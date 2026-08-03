import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AdsenseScript from "@/components/AdsenseScript";
import AdsPauseController from "@/components/AdsPauseController";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "밸런스랩 - AI로 만드는 1:1 밸런스게임",
  description: "AI 이미지로 밸런스게임을 만들고 공유·투표하는 무가입 서비스",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAdmin = await isAdminAuthenticated();

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AdsenseScript />
        <AdsPauseController />
        <SiteHeader isAdmin={isAdmin} />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
