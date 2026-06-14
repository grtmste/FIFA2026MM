import type { Metadata } from "next";
import BottomNav from "@/components/BottomNav";
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
      <body className="min-h-screen bg-navy text-gray-100">
        <div className="mx-auto min-h-screen w-full max-w-[430px] bg-navy pb-20">
          <header className="sticky top-0 z-40 border-b border-navy-light bg-navy/95 px-4 py-3 backdrop-blur">
            <h1 className="text-center text-lg font-bold tracking-wide text-gold">
              JALKA MM 2026
            </h1>
            <p className="text-center text-xs text-gray-400">
              Ennustusmäng
            </p>
          </header>
          <main className="px-4 py-4">{children}</main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
