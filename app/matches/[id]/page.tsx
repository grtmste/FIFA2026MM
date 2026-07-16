import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { calcMatchPoints } from "@/lib/scoring";
import { formatMatchDate, formatMatchTime } from "@/lib/format";
import { groupColor } from "@/lib/groupColors";
import { Match, Participant, Prediction } from "@/lib/types";

export const revalidate = 0;

export default async function MatchDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const matchId = Number(params.id);
  if (!Number.isFinite(matchId)) notFound();

  const [
    { data: match },
    { data: participants },
    { data: predictions },
  ] = await Promise.all([
    supabase.from("matches").select("*").eq("id", matchId).single(),
    supabase.from("participants").select("*").order("name", { ascending: true }),
    supabase.from("predictions").select("*").eq("match_id", matchId),
  ]);

  if (!match) notFound();

  const typedMatch = match as Match;
  const allParticipants = (participants ?? []) as Participant[];
  const allPredictions = (predictions ?? []) as Prediction[];

  const hasScore =
    typedMatch.actual_home_score !== null && typedMatch.actual_away_score !== null;

  return (
    <div className="space-y-4">
      <Link
        href="/matches"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink"
      >
        ← Tagasi mängude juurde
      </Link>

      <div
        className="overflow-hidden rounded-sm border border-line border-t-2 border-t-fifagreen/50 bg-surface shadow-card"
      >
        <div className="p-5">
          <div className="mb-3 flex items-center justify-center gap-2 text-xs text-muted">
            <span>{formatMatchDate(typedMatch.match_date)}</span>
            <span className="text-fifagreen/60">·</span>
            <span>{formatMatchTime(typedMatch.match_date)}</span>
            {typedMatch.group_name && (
              <span
                className="ml-1 flex h-5 items-center rounded-sm px-1.5 text-[10px] font-bold text-ink/80"
                style={{ backgroundColor: groupColor(typedMatch.group_name) }}
              >
                {typedMatch.group_name}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 flex-1 break-words text-right text-base font-semibold leading-tight text-ink">
              {typedMatch.home_team}
            </span>
            <span
              className={`min-w-[88px] flex-shrink-0 rounded-sm px-3 py-1.5 text-center text-2xl font-bold tabular-nums tracking-tight ${
                hasScore
                  ? "bg-gradient-to-br from-fifagreen to-fifacyan text-white shadow-sm"
                  : "bg-white/[0.06] text-muted"
              }`}
            >
              {hasScore
                ? `${typedMatch.actual_home_score} : ${typedMatch.actual_away_score}`
                : "vs"}
            </span>
            <span className="min-w-0 flex-1 break-words text-left text-base font-semibold leading-tight text-ink">
              {typedMatch.away_team}
            </span>
          </div>
          {hasScore && typedMatch.penalty_winner && (
            <div className="mt-2 text-center text-xs font-semibold text-fifagreen">
              {typedMatch.penalty_home_score != null &&
              typedMatch.penalty_away_score != null
                ? `Penaltid ${typedMatch.penalty_home_score}–${typedMatch.penalty_away_score} · `
                : "Penaltitega võitis "}
              {typedMatch.penalty_winner === "home"
                ? typedMatch.home_team
                : typedMatch.away_team}
            </div>
          )}
          {hasScore && !typedMatch.penalty_winner && typedMatch.extra_time_winner && (
            <div className="mt-2 text-center text-xs font-semibold text-fifagreen">
              {typedMatch.extra_time_home_score != null &&
              typedMatch.extra_time_away_score != null
                ? `Lisaajal ${typedMatch.extra_time_home_score}–${typedMatch.extra_time_away_score} · `
                : "Lisaajaga võitis "}
              {typedMatch.extra_time_winner === "home"
                ? typedMatch.home_team
                : typedMatch.away_team}
            </div>
          )}
          {(() => {
            // For knockout games show who advanced (normal time, or the
            // extra-time/penalty winner on a draw) instead of the venue
            // placeholder.
            if (typedMatch.stage !== "group" && hasScore) {
              const h = typedMatch.actual_home_score!;
              const a = typedMatch.actual_away_score!;
              const winner =
                h > a
                  ? typedMatch.home_team
                  : a > h
                  ? typedMatch.away_team
                  : typedMatch.extra_time_winner === "home"
                  ? typedMatch.home_team
                  : typedMatch.extra_time_winner === "away"
                  ? typedMatch.away_team
                  : typedMatch.penalty_winner === "home"
                  ? typedMatch.home_team
                  : typedMatch.penalty_winner === "away"
                  ? typedMatch.away_team
                  : null;
              if (winner) {
                return (
                  <div className="mt-3 text-center text-xs font-semibold text-ink">
                    Edasi pääses: <span className="text-fifagreen">{winner}</span>
                  </div>
                );
              }
            }
            return (
              <div className="mt-3 text-center text-xs text-muted">
                {typedMatch.venue ?? "Selgub"}
              </div>
            );
          })()}
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h3 className="section-title whitespace-nowrap text-lg text-ink">
            Ennustused
          </h3>
          <div className="gold-rule flex-1" />
        </div>

        {allParticipants.length === 0 && (
          <p className="text-sm text-muted">Osalejaid ei ole veel lisatud.</p>
        )}

        {allParticipants.length > 0 && (
          <div className="overflow-hidden rounded-sm border border-line bg-surface shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.04] text-left text-xs uppercase text-muted">
                  <th className="px-3 py-2">Nimi</th>
                  <th className="px-3 py-2 text-center">Ennustus</th>
                  {hasScore && <th className="px-3 py-2 text-center">Punktid</th>}
                </tr>
              </thead>
              <tbody>
                {allParticipants.map((participant) => {
                  const prediction = allPredictions.find(
                    (p) => p.participant_id === participant.id
                  );
                  const points =
                    hasScore && prediction
                      ? calcMatchPoints(prediction, typedMatch)
                      : null;

                  return (
                    <tr key={participant.id} className="border-t border-line/60">
                      <td className="px-3 py-2 font-medium text-ink">
                        {participant.name}
                      </td>
                      <td className="px-3 py-2 text-center text-ink/75">
                        {prediction
                          ? `${prediction.predicted_home_score} : ${prediction.predicted_away_score}`
                          : "–"}
                      </td>
                      {hasScore && (
                        <td className="px-3 py-2 text-center font-bold text-fifagreen">
                          {prediction ? `${points} p` : "–"}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
