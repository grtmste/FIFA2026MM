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
      className="group relative flex transform-gpu overflow-hidden rounded-lg border border-line bg-surface shadow-card transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform hover:-translate-y-1.5 hover:border-fifagreen/60 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={{ borderLeft: `3px solid ${groupColor(match.group_name)}` }}
    >
      {/* Gravity glow that blooms in on hover */}
      <span
        className="pointer-events-none absolute -inset-px z-0 scale-90 rounded-lg opacity-0 transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100"
        style={{
          background: `radial-gradient(120% 90% at 50% 120%, ${groupColor(
            match.group_name
          )}22, transparent 70%)`,
        }}
      />
      <div className="relative z-10 flex w-9 flex-shrink-0 items-center justify-center bg-white/[0.05] text-base font-bold text-muted">
        {match.id}
      </div>
      <div className="relative z-10 min-w-0 flex-1 p-3">
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted">
          <span>{formatMatchDate(match.match_date)}</span>
          <span>{formatMatchTime(match.match_date)}</span>
          {match.group_name && (
            <span
              className="flex h-4 items-center rounded-sm px-1.5 text-[10px] font-bold text-ink/80"
              style={{ backgroundColor: groupColor(match.group_name) }}
            >
              {match.group_name}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-1.5">
          <span className="min-w-0 flex-1 break-words text-right text-sm font-semibold leading-tight text-ink">
            {match.home_team}
          </span>
          <span
            className={`min-w-[58px] flex-shrink-0 rounded-sm px-2 py-1 text-center text-base font-bold tabular-nums tracking-tight ${
              hasScore
                ? "bg-gradient-to-br from-fifagreen to-fifacyan text-white shadow-sm"
                : "bg-white/[0.06] text-muted"
            }`}
          >
            {hasScore
              ? `${match.actual_home_score} : ${match.actual_away_score}`
              : "vs"}
          </span>
          <span className="min-w-0 flex-1 break-words text-left text-sm font-semibold leading-tight text-ink">
            {match.away_team}
          </span>
        </div>
        <div className="mt-1.5 text-center text-[11px] text-muted">
          {hasScore
            ? match.actual_home_score! > match.actual_away_score!
              ? "Koduvõit"
              : match.actual_home_score! < match.actual_away_score!
              ? "Võõrsvõit"
              : "Viik"
            : match.venue ?? "Selgub"}
        </div>
        {hasScore && match.penalty_winner && (
          <div className="mt-0.5 flex items-center justify-center gap-2 text-xs font-semibold text-muted">
            {match.penalty_home_score != null &&
            match.penalty_away_score != null ? (
              <>
                <span
                  className={
                    match.penalty_winner === "home"
                      ? "text-fifagreen"
                      : "text-muted"
                  }
                >
                  {match.penalty_home_score}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted">
                  penaltid
                </span>
                <span
                  className={
                    match.penalty_winner === "away"
                      ? "text-fifagreen"
                      : "text-muted"
                  }
                >
                  {match.penalty_away_score}
                </span>
              </>
            ) : (
              <span className="text-fifagreen">
                pen.{" "}
                {match.penalty_winner === "home"
                  ? match.home_team
                  : match.away_team}
              </span>
            )}
          </div>
        )}
        {hasScore && !match.penalty_winner && match.extra_time_winner && (
          <div className="mt-0.5 flex items-center justify-center gap-2 text-xs font-semibold text-muted">
            {match.extra_time_home_score != null &&
            match.extra_time_away_score != null ? (
              <>
                <span
                  className={
                    match.extra_time_winner === "home"
                      ? "text-fifagreen"
                      : "text-muted"
                  }
                >
                  {match.extra_time_home_score}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted">
                  lisaajal
                </span>
                <span
                  className={
                    match.extra_time_winner === "away"
                      ? "text-fifagreen"
                      : "text-muted"
                  }
                >
                  {match.extra_time_away_score}
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] uppercase tracking-wider text-muted">
                  lisaajal
                </span>
                <span className="text-fifagreen">
                  {match.extra_time_winner === "home"
                    ? match.home_team
                    : match.away_team}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
