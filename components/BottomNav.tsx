"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/nav";
import NavIcon from "@/components/NavIcon";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_-12px_rgba(61,90,192,0.3)] backdrop-blur-lg md:hidden">
      <ul className="flex items-stretch justify-between">
        {NAV_LINKS.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <li key={link.href} className="flex-1">
              <Link
                href={link.href}
                className={`group flex flex-col items-center gap-1 py-2 text-[11px] font-semibold transition-colors active:scale-95 ${
                  isActive ? "text-fifared" : "text-muted"
                }`}
              >
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-xl transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-0.5 group-active:scale-90 ${
                    isActive
                      ? "bg-gradient-to-br from-gold/15 to-purple/10 shadow-sm"
                      : "group-hover:bg-white/[0.06]"
                  }`}
                >
                  <NavIcon
                    name={link.icon}
                    className={`h-[23px] w-[23px] transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? "text-fifared" : "text-muted group-hover:text-ink"
                    }`}
                  />
                </span>
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
