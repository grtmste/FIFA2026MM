import type { SVGProps } from "react";

export type IconName = "trophy" | "ball" | "bonus" | "lock";

const PATHS: Record<IconName, React.ReactNode> = {
  trophy: (
    <>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </>
  ),
  ball: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 7.2l4.5 3.27-1.72 5.3H9.22l-1.72-5.3L12 7.2Z" />
      <path d="M12 2.5v4.7M3 9.4l4.5 1.07M21 9.4l-4.5 1.07M6.4 19.6l2.82-3.83M17.6 19.6l-2.82-3.83" />
    </>
  ),
  bonus: (
    <path d="M12 2.5l2.9 6.04 6.6.62-4.98 4.4 1.46 6.48L12 17.1l-5.98 2.94 1.46-6.48L2.5 9.16l6.6-.62L12 2.5Z" />
  ),
  lock: (
    <>
      <rect x="3.5" y="11" width="17" height="10.5" rx="2.5" />
      <path d="M7.5 11V7.5a4.5 4.5 0 0 1 9 0V11" />
    </>
  ),
};

export default function NavIcon({
  name,
  ...props
}: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {PATHS[name]}
    </svg>
  );
}
