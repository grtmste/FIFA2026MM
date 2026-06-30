import type { IconName } from "@/components/NavIcon";

export interface NavLink {
  href: string;
  label: string;
  icon: IconName;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Edetabel", icon: "trophy" },
  { href: "/matches", label: "Mängud", icon: "ball" },
  { href: "/boonused", label: "Boonused", icon: "bonus" },
  { href: "/admin", label: "Admin", icon: "lock" },
];
