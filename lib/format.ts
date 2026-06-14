const dateFormatter = new Intl.DateTimeFormat("et-EE", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Europe/Tallinn",
});

const timeFormatter = new Intl.DateTimeFormat("et-EE", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Tallinn",
});

export function formatMatchDate(isoDate: string | null): string {
  if (!isoDate) return "Selgub";
  return dateFormatter.format(new Date(isoDate));
}

export function formatMatchTime(isoDate: string | null): string {
  if (!isoDate) return "Selgub";
  return `${timeFormatter.format(new Date(isoDate))} EET`;
}
