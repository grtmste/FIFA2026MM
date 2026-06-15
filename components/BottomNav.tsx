"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/nav";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 border-t border-slate-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden">
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
                className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors active:scale-95 ${
                  isActive ? "text-gold" : "text-slate-400"
                }`}
              >
                <span
                  className={`flex h-7 w-12 items-center justify-center rounded-full text-lg leading-none transition-colors ${
                    isActive ? "bg-gold/10" : ""
                  }`}
                >
                  {link.icon}
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
