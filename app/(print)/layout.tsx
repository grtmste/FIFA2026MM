import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jalka MM 2026 – Ennustusleht",
};

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="et" className={inter.variable}>
      <body className="bg-white font-sans text-navy">{children}</body>
    </html>
  );
}
