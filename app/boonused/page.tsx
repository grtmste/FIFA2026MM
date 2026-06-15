import { supabase } from "@/lib/supabase";
import { BonusAnswer, BonusQuestion, Participant } from "@/lib/types";

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
      <h2 className="text-xl font-bold text-navy">Boonusküsimused</h2>

      {(questionsError || bonusQuestions.length === 0) && (
        <p className="text-sm text-red-500">
          Boonusküsimusi ei leitud. Kontrolli, et Supabase on seadistatud ja
          scripts/seed.sql on käivitatud.
        </p>
      )}

      {allParticipants.length === 0 && (
        <p className="text-sm text-slate-400">
          Osalejaid ei ole veel lisatud.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {bonusQuestions.map((question, idx) => (
          <section
            key={question.id}
            className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <h3 className="text-sm font-semibold text-navy">
              {idx + 1}. {question.question_text}
            </h3>
            <p className="text-xs text-slate-500">
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
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-xs uppercase text-slate-500">
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
                          className="border-t border-slate-100"
                        >
                          <td className="px-2 py-1 font-medium text-navy">
                            {participant.name}
                          </td>
                          <td className="px-2 py-1 text-slate-600">
                            {answer?.answer_text || "–"}
                          </td>
                          <td className="px-2 py-1 text-center text-slate-600">
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
