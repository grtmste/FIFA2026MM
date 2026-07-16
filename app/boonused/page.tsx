import { supabase } from "@/lib/supabase";
import { fetchAllRows } from "@/lib/fetchAll";
import { BonusAnswer, BonusQuestion, Participant } from "@/lib/types";
import SectionHeading from "@/components/SectionHeading";
import BonusAccordion from "@/components/BonusAccordion";

export const revalidate = 0;

export default async function BonusPage() {
  const [
    { data: questions, error: questionsError },
    { data: participants },
    answers,
  ] = await Promise.all([
    supabase.from("bonus_questions").select("*").order("id", { ascending: true }),
    supabase.from("participants").select("*").order("name", { ascending: true }),
    fetchAllRows<BonusAnswer>(supabase, "bonus_answers"),
  ]);

  const bonusQuestions = (questions ?? []) as BonusQuestion[];
  const allParticipants = (participants ?? []) as Participant[];
  const allAnswers = answers as BonusAnswer[];

  return (
    <div className="space-y-5">
      <SectionHeading eyebrow="Lisapunktid" title="Boonusküsimused" />

      {(questionsError || bonusQuestions.length === 0) && (
        <p className="text-sm text-fifared">
          Boonusküsimusi ei leitud. Kontrolli, et Supabase on seadistatud ja
          scripts/seed.sql on käivitatud.
        </p>
      )}

      {allParticipants.length === 0 && bonusQuestions.length > 0 && (
        <p className="text-sm text-muted">Osalejaid ei ole veel lisatud.</p>
      )}

      {bonusQuestions.length > 0 && (
        <BonusAccordion
          questions={bonusQuestions}
          participants={allParticipants}
          answers={allAnswers}
        />
      )}
    </div>
  );
}
