"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Edetabel", icon: "🏆" },
  { href: "/matches", label: "Mängud", icon: "⚽" },
  { href: "/boonused", label: "Boonused", icon: "❓" },
  { href: "/admin", label: "Admin", icon: "🔒" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 border-t border-navy-light bg-navy">
      <ul className="flex items-stretch justify-between">
        {links.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <li key={link.href} className="flex-1">
              <Link
                href={link.href}
                className={`flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
                  isActive ? "text-gold" : "text-gray-400"
                }`}
              >
                <span className="text-lg leading-none">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
