export const GROUP_COLORS: Record<string, string> = {
  A: "#D62828",
  B: "#1D4ED8",
  C: "#16A34A",
  D: "#F77F00",
  E: "#7C3AED",
  F: "#0D9488",
  G: "#EA580C",
  H: "#312E81",
  I: "#059669",
  J: "#DB2777",
  K: "#92400E",
  L: "#475569",
};

export function groupColor(groupName: string | null): string {
  if (!groupName) return "#475569";
  return GROUP_COLORS[groupName] ?? "#475569";
}
