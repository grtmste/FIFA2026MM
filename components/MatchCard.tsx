import Link from "next/link";
import { Match } from "@/lib/types";
import { formatMatchDate, formatMatchTime } from "@/lib/format";
import { groupColor } from "@/lib/groupColors";

export default function MatchCard({ match }: { match: Match }) {
  const hasScore =
    match.actual_home_score !== null && match.actual_away_score !== null;

  return (
    <Link
      href={`/matches/${match.id}`}
      className="group flex overflow-hidden rounded-sm border border-stone-200 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-card-hover"
      style={{ borderLeft: `3px solid ${groupColor(match.group_name)}` }}
    >
      <div className="flex w-9 flex-shrink-0 items-center justify-center bg-stone-50 text-base font-bold text-stone-400">
        {match.id}
      </div>
      <div className="min-w-0 flex-1 p-3">
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-stone-400">
          <span>{formatMatchDate(match.match_date)}</span>
          <span>{formatMatchTime(match.match_date)}</span>
          {match.group_name && (
            <span
              className="flex h-4 items-center rounded-sm px-1.5 text-[10px] font-bold text-navy/80"
              style={{ backgroundColor: groupColor(match.group_name) }}
            >
              {match.group_name}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-1.5">
          <span className="min-w-0 flex-1 break-words text-right text-sm font-semibold leading-tight text-navy">
            {match.home_team}
          </span>
          <span
            className={`min-w-[58px] flex-shrink-0 rounded-sm px-2 py-1 text-center text-base font-bold tabular-nums tracking-tight ${
              hasScore
                ? "bg-gradient-to-br from-navy to-gold text-white shadow-sm"
                : "bg-stone-100 text-stone-400"
            }`}
          >
            {hasScore
              ? `${match.actual_home_score} : ${match.actual_away_score}`
              : "vs"}
          </span>
          <span className="min-w-0 flex-1 break-words text-left text-sm font-semibold leading-tight text-navy">
            {match.away_team}
          </span>
        </div>
        <div className="mt-1.5 text-center text-[11px] text-stone-400">
          {hasScore
            ? match.actual_home_score! > match.actual_away_score!
              ? "Koduvõit"
              : match.actual_home_score! < match.actual_away_score!
              ? "Võõrsvõit"
              : "Viik"
            : match.venue ?? "Selgub"}
        </div>
      </div>
    </Link>
  );
}
