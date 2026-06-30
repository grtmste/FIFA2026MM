import type { Metadata } from "next";
import { Inter } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import Logo from "@/components/Logo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jalka MM 2026 Ennustusmäng",
  description: "FIFA Maailmameistrivõistlused 2026 ennustusmäng",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="et" className={inter.variable}>
      <body className="min-h-screen bg-cream font-sans text-navy">
        <div className="mx-auto min-h-screen w-full max-w-[480px] pb-24 md:max-w-none md:pb-10">
          <header className="sticky top-0 z-40 border-b border-white/60 bg-gradient-to-r from-champagne/80 via-cream/70 to-blush/80 px-4 py-3.5 shadow-[0_4px_24px_-12px_rgba(61,90,192,0.25)] backdrop-blur-xl md:px-8 lg:px-12">
            <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between">
              <Logo />
              <TopNav />
            </div>
          </header>
          <main className="animate-fade-in-up mx-auto w-full max-w-screen-2xl px-4 py-6 md:px-8 md:py-8 lg:px-12">
            {children}
          </main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
