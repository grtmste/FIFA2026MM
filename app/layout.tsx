import type { Metadata } from "next";
import { Inter } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
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
        <div className="mx-auto min-h-screen w-full max-w-[480px] pb-24 md:max-w-2xl md:pb-10 lg:max-w-4xl">
          <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-cream/70 px-4 py-3.5 backdrop-blur-xl md:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-navy/10 bg-gradient-to-br from-navy to-gold text-lg shadow-sm">
                  ⚽
                </span>
                <div>
                  <h1 className="text-2xl font-extrabold leading-none tracking-tight text-navy md:text-[1.65rem]">
                    Jalka <span className="gradient-text">MM</span>
                  </h1>
                  <p className="eyebrow mt-1">2026 Ennustusmäng</p>
                </div>
              </div>
              <TopNav />
            </div>
          </header>
          <main className="animate-fade-in-up px-4 py-6 md:px-8 md:py-8">
            {children}
          </main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
