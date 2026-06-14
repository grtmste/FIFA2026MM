import { supabase } from "@/lib/supabase";
import { BonusAnswer, BonusQuestion, Participant } from "@/lib/types";

export const revalidate = 0;

export default async function BonusPage() {
  const [
    { data: questions },
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
      <h2 className="text-xl font-bold text-gold">Boonusküsimused</h2>

      {allParticipants.length === 0 && (
        <p className="text-sm text-gray-400">
          Osalejaid ei ole veel lisatud.
        </p>
      )}

      {bonusQuestions.map((question, idx) => (
        <section
          key={question.id}
          className="space-y-2 rounded-xl border border-navy-light bg-navy-light/40 p-3"
        >
          <h3 className="text-sm font-semibold">
            {idx + 1}. {question.question_text}
          </h3>
          <p className="text-xs text-gray-400">
            Maksimum: {question.max_points} punkti
            {question.correct_answer && (
              <>
                {" "}
                · Õige vastus:{" "}
                <span className="text-gold">{question.correct_answer}</span>
              </>
            )}
          </p>

          {allParticipants.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-navy-light">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy text-left text-xs uppercase text-gray-400">
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
                        className="border-t border-navy-light"
                      >
                        <td className="px-2 py-1 font-medium">
                          {participant.name}
                        </td>
                        <td className="px-2 py-1 text-gray-300">
                          {answer?.answer_text || "–"}
                        </td>
                        <td className="px-2 py-1 text-center">
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
  );
}
