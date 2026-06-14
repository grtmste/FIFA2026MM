import { Match } from "@/lib/types";
import { formatMatchDate, formatMatchTime } from "@/lib/format";
import { groupColor } from "@/lib/groupColors";

export default function MatchCard({ match }: { match: Match }) {
  const hasScore =
    match.actual_home_score !== null && match.actual_away_score !== null;

  return (
    <div
      className="flex overflow-hidden rounded-xl border border-navy-light bg-navy-light/40"
      style={{ borderLeft: `4px solid ${groupColor(match.group_name)}` }}
    >
      <div className="flex w-9 flex-shrink-0 items-center justify-center bg-navy text-xs font-bold text-gray-400">
        {match.id}
      </div>
      <div className="flex-1 p-3">
        <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
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
          <span className="flex-1 text-right text-sm font-medium pr-2">
            {match.home_team}
          </span>
          <span className="min-w-[56px] rounded-md bg-navy px-2 py-1 text-center text-sm font-bold text-gold">
            {hasScore
              ? `${match.actual_home_score} : ${match.actual_away_score}`
              : "vs"}
          </span>
          <span className="flex-1 text-sm font-medium pl-2">
            {match.away_team}
          </span>
        </div>
        <div className="mt-1 text-center text-xs text-gray-500">
          {match.venue ?? "Selgub"}
        </div>
      </div>
    </div>
  );
}
