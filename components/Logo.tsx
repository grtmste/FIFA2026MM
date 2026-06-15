export default function Logo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/Football-header.svg"
      alt="Jalka MM 2026 Ennustusmäng"
      className={`h-16 w-auto md:h-20 ${className ?? ""}`}
    />
  );
}
