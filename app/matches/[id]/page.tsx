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
        className="inline-flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-navy"
      >
        ← Tagasi mängude juurde
      </Link>

      <div
        className="overflow-hidden rounded-sm border border-stone-200 border-t-2 border-t-gold/50 bg-white shadow-card"
      >
        <div className="p-5">
          <div className="mb-3 flex items-center justify-center gap-2 text-xs text-stone-400">
            <span>{formatMatchDate(typedMatch.match_date)}</span>
            <span className="text-gold/60">·</span>
            <span>{formatMatchTime(typedMatch.match_date)}</span>
            {typedMatch.group_name && (
              <span
                className="ml-1 flex h-5 items-center rounded-sm px-1.5 text-[10px] font-bold text-navy/80"
                style={{ backgroundColor: groupColor(typedMatch.group_name) }}
              >
                {typedMatch.group_name}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex-1 text-right text-base font-semibold text-navy">
              {typedMatch.home_team}
            </span>
            <span
              className={`section-title min-w-[84px] rounded-sm px-3 py-1.5 text-center text-2xl ${
                hasScore ? "bg-navy text-gold" : "bg-stone-100 text-stone-400"
              }`}
            >
              {hasScore
                ? `${typedMatch.actual_home_score} : ${typedMatch.actual_away_score}`
                : "vs"}
            </span>
            <span className="flex-1 text-left text-base font-semibold text-navy">
              {typedMatch.away_team}
            </span>
          </div>
          <div className="mt-3 text-center text-xs text-stone-400">
            {typedMatch.venue ?? "Selgub"}
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h3 className="section-title whitespace-nowrap text-lg text-navy">
            Ennustused
          </h3>
          <div className="gold-rule flex-1" />
        </div>

        {allParticipants.length === 0 && (
          <p className="text-sm text-stone-400">Osalejaid ei ole veel lisatud.</p>
        )}

        {allParticipants.length > 0 && (
          <div className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-left text-xs uppercase text-stone-500">
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
                    <tr key={participant.id} className="border-t border-stone-100">
                      <td className="px-3 py-2 font-medium text-navy">
                        {participant.name}
                      </td>
                      <td className="px-3 py-2 text-center text-stone-600">
                        {prediction
                          ? `${prediction.predicted_home_score} : ${prediction.predicted_away_score}`
                          : "–"}
                      </td>
                      {hasScore && (
                        <td className="px-3 py-2 text-center font-bold text-gold">
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
