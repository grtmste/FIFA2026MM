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
        <div className="mx-auto min-h-screen w-full max-w-[480px] bg-cream pb-24 md:max-w-2xl md:pb-8 lg:max-w-4xl">
          <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/80 px-4 py-3 backdrop-blur-lg md:px-8">
            <div className="flex items-center justify-between md:py-1">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark text-lg shadow-sm">
                  ⚽
                </span>
                <div>
                  <h1 className="text-lg font-extrabold leading-none tracking-tight text-navy md:text-xl">
                    JALKA <span className="text-gold">MM 2026</span>
                  </h1>
                  <p className="mt-0.5 text-xs text-stone-500">Ennustusmäng</p>
                </div>
              </div>
              <TopNav />
            </div>
          </header>
          <main className="animate-fade-in-up px-4 py-5 md:px-8 md:py-6">
            {children}
          </main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
