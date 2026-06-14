export interface NavLink {
  href: string;
  label: string;
  icon: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Edetabel", icon: "🏆" },
  { href: "/matches", label: "Mängud", icon: "⚽" },
  { href: "/boonused", label: "Boonused", icon: "❓" },
  { href: "/admin", label: "Admin", icon: "🔒" },
];
