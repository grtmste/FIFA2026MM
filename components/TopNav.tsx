"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/nav";
import NavIcon from "@/components/NavIcon";

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:block">
      <ul className="flex items-center gap-1">
        {NAV_LINKS.map((link) => {
          const isActive =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`group flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95 ${
                  isActive
                    ? "bg-gradient-to-br from-navy to-blue-700 text-white shadow-card"
                    : "text-ink/75 hover:-translate-y-0.5 hover:bg-surface/80 hover:text-ink hover:shadow-card"
                }`}
              >
                <NavIcon
                  name={link.icon}
                  className={`h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-white" : "text-fifagreen"
                  }`}
                />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
