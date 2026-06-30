import Link from "next/link";

export default function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Jalka MM 2026 Ennustusmäng - Edetabel"
      className="group inline-block"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/Football-header.svg"
        alt="Jalka MM 2026 Ennustusmäng"
        className={`h-20 w-auto animate-float drop-shadow-[0_8px_18px_rgba(61,90,192,0.18)] transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:animate-none md:h-28 ${className ?? ""}`}
      />
    </Link>
  );
}
