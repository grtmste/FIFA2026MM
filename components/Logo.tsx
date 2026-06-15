import Link from "next/link";

export default function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="Jalka MM 2026 Ennustusmäng - Edetabel">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/Football-header.svg"
        alt="Jalka MM 2026 Ennustusmäng"
        className={`h-20 w-auto md:h-28 ${className ?? ""}`}
      />
    </Link>
  );
}
