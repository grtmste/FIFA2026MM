"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/nav";

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
                className={`rounded-sm px-3 py-2 text-sm font-semibold transition-all duration-150 active:scale-95 ${
                  isActive
                    ? "bg-navy text-white shadow-sm"
                    : "text-stone-600 hover:bg-stone-100 hover:text-navy"
                }`}
              >
                <span className="mr-1">{link.icon}</span>
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
