import { supabase } from "@/lib/supabase";
import { Match, Stage, STAGE_LABELS } from "@/lib/types";
import MatchCard from "@/components/MatchCard";

export const revalidate = 0;

const KNOCKOUT_ORDER: Stage[] = ["r32", "r16", "qf", "sf", "final"];

export default async function MatchesPage() {
  const { data: matches, error } = await supabase
    .from("matches")
    .select("*")
    .order("match_date", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  const allMatches = (matches ?? []) as Match[];
  const groupMatches = allMatches.filter((m) => m.stage === "group");

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-navy">Mängud</h2>

      {(error || allMatches.length === 0) && (
        <p className="text-sm text-red-500">
          Mänge ei leitud. Kontrolli, et Supabase on seadistatud ja
          scripts/seed.sql on käivitatud.
        </p>
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          Alagrupi mängud
        </h3>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {groupMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>

      {KNOCKOUT_ORDER.map((stage) => {
        const stageMatches = allMatches.filter((m) => m.stage === stage);
        if (stageMatches.length === 0) return null;

        return (
          <section key={stage} className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              {STAGE_LABELS[stage]}
            </h3>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {stageMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
