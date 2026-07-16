import { supabase } from "@/lib/supabase";
import { Match } from "@/lib/types";
import MatchesAccordion from "@/components/MatchesAccordion";
import SectionHeading from "@/components/SectionHeading";

export const revalidate = 0;

export default async function MatchesPage() {
  const { data: matches, error } = await supabase
    .from("matches")
    .select("*")
    .order("match_date", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });

  const allMatches = (matches ?? []) as Match[];

  return (
    <div className="space-y-5">
      <SectionHeading eyebrow="Kava" title="Mängud" />

      {(error || allMatches.length === 0) && (
        <p className="text-sm text-fifared">
          Mänge ei leitud. Kontrolli, et Supabase on seadistatud ja
          scripts/seed.sql on käivitatud.
        </p>
      )}

      {allMatches.length > 0 && <MatchesAccordion matches={allMatches} />}
    </div>
  );
}
