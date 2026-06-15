export const GROUP_COLORS: Record<string, string> = {
  A: "#D98C9A",
  B: "#8FB6D9",
  C: "#8FC6A9",
  D: "#E0A97A",
  E: "#A99BD4",
  F: "#7FC2BC",
  G: "#D99A7A",
  H: "#9A99C9",
  I: "#A6C285",
  J: "#D98FAE",
  K: "#C2A572",
  L: "#9CACBE",
};

export function groupColor(groupName: string | null): string {
  if (!groupName) return "#9CACBE";
  return GROUP_COLORS[groupName] ?? "#9CACBE";
}
