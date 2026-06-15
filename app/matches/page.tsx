import { supabase } from "@/lib/supabase";
import { Match, Stage, STAGE_LABELS } from "@/lib/types";
import MatchCard from "@/components/MatchCard";
import SectionHeading from "@/components/SectionHeading";

function StageHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h3 className="section-title whitespace-nowrap text-lg text-navy">
        {children}
      </h3>
      <div className="gold-rule flex-1" />
    </div>
  );
}

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
    <div className="space-y-7">
      <SectionHeading eyebrow="Kava" title="Mängud" />

      {(error || allMatches.length === 0) && (
        <p className="text-sm text-red-500">
          Mänge ei leitud. Kontrolli, et Supabase on seadistatud ja
          scripts/seed.sql on käivitatud.
        </p>
      )}

      <section className="space-y-3.5">
        <StageHeading>Alagrupi mängud</StageHeading>
        <div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-3">
          {groupMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>

      {KNOCKOUT_ORDER.map((stage) => {
        const stageMatches = allMatches.filter((m) => m.stage === stage);
        if (stageMatches.length === 0) return null;

        return (
          <section key={stage} className="space-y-3.5">
            <StageHeading>{STAGE_LABELS[stage]}</StageHeading>
            <div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-3">
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
