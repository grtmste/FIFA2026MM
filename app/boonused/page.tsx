import { supabase } from "@/lib/supabase";
import { BonusAnswer, BonusQuestion, Participant } from "@/lib/types";
import SectionHeading from "@/components/SectionHeading";

export const revalidate = 0;

export default async function BonusPage() {
  const [
    { data: questions, error: questionsError },
    { data: participants },
    { data: answers },
  ] = await Promise.all([
    supabase.from("bonus_questions").select("*").order("id", { ascending: true }),
    supabase.from("participants").select("*").order("name", { ascending: true }),
    supabase.from("bonus_answers").select("*"),
  ]);

  const bonusQuestions = (questions ?? []) as BonusQuestion[];
  const allParticipants = (participants ?? []) as Participant[];
  const allAnswers = (answers ?? []) as BonusAnswer[];

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Lisapunktid" title="Boonusküsimused" />

      {(questionsError || bonusQuestions.length === 0) && (
        <p className="text-sm text-red-500">
          Boonusküsimusi ei leitud. Kontrolli, et Supabase on seadistatud ja
          scripts/seed.sql on käivitatud.
        </p>
      )}

      {allParticipants.length === 0 && (
        <p className="text-sm text-stone-400">
          Osalejaid ei ole veel lisatud.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {bonusQuestions.map((question, idx) => (
          <section
            key={question.id}
            className="space-y-2 rounded-sm border border-stone-200 border-t-2 border-t-gold/40 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <h3 className="flex items-baseline gap-2 text-sm font-semibold text-navy">
              <span className="section-title text-2xl leading-none text-gold">
                {idx + 1}
              </span>
              {question.question_text}
            </h3>
            <p className="text-xs text-stone-500">
              Maksimum: {question.max_points} punkti
              {question.correct_answer && (
                <>
                  {" "}
                  · Õige vastus:{" "}
                  <span className="font-semibold text-gold">{question.correct_answer}</span>
                </>
              )}
            </p>

            {allParticipants.length > 0 && (
              <div className="overflow-hidden rounded-sm border border-stone-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-50 text-left text-xs uppercase text-stone-500">
                      <th className="px-2 py-1">Nimi</th>
                      <th className="px-2 py-1">Vastus</th>
                      <th className="px-2 py-1 text-center">Punktid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allParticipants.map((participant) => {
                      const answer = allAnswers.find(
                        (a) =>
                          a.participant_id === participant.id &&
                          a.question_id === question.id
                      );

                      return (
                        <tr
                          key={participant.id}
                          className="border-t border-stone-100"
                        >
                          <td className="px-2 py-1 font-medium text-navy">
                            {participant.name}
                          </td>
                          <td className="px-2 py-1 text-stone-600">
                            {answer?.answer_text || "–"}
                          </td>
                          <td className="px-2 py-1 text-center text-stone-600">
                            {answer?.points_awarded !== null &&
                            answer?.points_awarded !== undefined
                              ? `${answer.points_awarded} p`
                              : "–"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
