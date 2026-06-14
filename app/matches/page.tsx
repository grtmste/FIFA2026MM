import { supabase } from "@/lib/supabase";
import { Match, Stage, STAGE_LABELS } from "@/lib/types";
import MatchCard from "@/components/MatchCard";
import { groupColor } from "@/lib/groupColors";

export const revalidate = 0;

const KNOCKOUT_ORDER: Stage[] = ["r32", "r16", "qf", "sf", "final"];

export default async function MatchesPage() {
  const { data: matches, error } = await supabase
    .from("matches")
    .select("*")
    .order("id", { ascending: true });

  const allMatches = (matches ?? []) as Match[];

  const groupMatches = allMatches.filter((m) => m.stage === "group");
  const groups = Array.from(
    new Set(groupMatches.map((m) => m.group_name).filter(Boolean))
  ).sort() as string[];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gold">Mängud</h2>

      {(error || allMatches.length === 0) && (
        <p className="text-sm text-red-400">
          Mänge ei leitud. Kontrolli, et Supabase on seadistatud ja
          scripts/seed.sql on käivitatud.
        </p>
      )}

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Alagrupi mängud
        </h3>
        {groups.map((groupName) => (
          <div key={groupName} className="space-y-2">
            <h4
              className="rounded-md px-2 py-1 text-sm font-bold text-white"
              style={{ backgroundColor: groupColor(groupName) }}
            >
              Grupp {groupName}
            </h4>
            <div className="space-y-2">
              {groupMatches
                .filter((m) => m.group_name === groupName)
                .map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
            </div>
          </div>
        ))}
      </section>

      {KNOCKOUT_ORDER.map((stage) => {
        const stageMatches = allMatches.filter((m) => m.stage === stage);
        if (stageMatches.length === 0) return null;

        return (
          <section key={stage} className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              {STAGE_LABELS[stage]}
            </h3>
            <div className="space-y-2">
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
