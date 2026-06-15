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
      className="group flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-gold hover:shadow-card-hover"
      style={{ borderLeft: `4px solid ${groupColor(match.group_name)}` }}
    >
      <div className="flex w-9 flex-shrink-0 items-center justify-center bg-slate-50 text-xs font-bold text-slate-400">
        {match.id}
      </div>
      <div className="flex-1 p-3">
        <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
          <span>{formatMatchDate(match.match_date)}</span>
          <span>{formatMatchTime(match.match_date)}</span>
          {match.group_name && (
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
              style={{ backgroundColor: groupColor(match.group_name) }}
            >
              {match.group_name}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="flex-1 text-right text-sm font-semibold text-navy pr-2">
            {match.home_team}
          </span>
          <span
            className={`min-w-[56px] rounded-md px-2 py-1 text-center text-sm font-bold ${
              hasScore ? "bg-navy text-gold" : "bg-slate-100 text-slate-400"
            }`}
          >
            {hasScore
              ? `${match.actual_home_score} : ${match.actual_away_score}`
              : "vs"}
          </span>
          <span className="flex-1 text-sm font-semibold text-navy pl-2">
            {match.away_team}
          </span>
        </div>
        <div className="mt-1 text-center text-xs text-slate-400">
          {match.venue ?? "Selgub"}
        </div>
      </div>
    </Link>
  );
}
