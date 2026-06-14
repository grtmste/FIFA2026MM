import type { Metadata } from "next";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import "./globals.css";

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
    <html lang="et">
      <body className="min-h-screen bg-cream text-navy">
        <div className="mx-auto min-h-screen w-full max-w-[480px] bg-cream pb-20 md:max-w-2xl md:pb-8 lg:max-w-4xl">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-8">
            <div className="flex items-center justify-between md:py-1">
              <div>
                <h1 className="text-lg font-extrabold tracking-wide text-navy md:text-xl">
                  JALKA <span className="text-gold">MM 2026</span>
                </h1>
                <p className="text-xs text-slate-500">Ennustusmäng</p>
              </div>
              <TopNav />
            </div>
          </header>
          <main className="px-4 py-4 md:px-8 md:py-6">{children}</main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
