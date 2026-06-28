import { supabase } from "@/lib/supabase";
import { fetchAllRows } from "@/lib/fetchAll";
import { BonusAnswer, BonusQuestion, Participant } from "@/lib/types";
import SectionHeading from "@/components/SectionHeading";

export const revalidate = 0;

// Section order + headings for the bonus categories.
const CATEGORIES: { key: string; title: string }[] = [
  { key: "alagrupp", title: "Boonusküsimused - alagrupi mängud" },
  { key: "1/32", title: "Boonusküsimused - 1/32" },
  { key: "jokker", title: "Jokker combo - 1/32" },
];

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

  // Group questions by category, keeping any unknown category in a trailing
  // "alagrupp" bucket so nothing silently disappears.
  const byCategory = new Map<string, BonusQuestion[]>();
  for (const q of bonusQuestions) {
    const cat = q.category && CATEGORIES.some((c) => c.key === q.category)
      ? q.category
      : "alagrupp";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(q);
  }

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Lisapunktid" title="Boonusküsimused" />

      {(questionsError || bonusQuestions.length === 0) && (
        <p className="text-sm text-red-500">
          Boonusküsimusi ei leitud. Kontrolli, et Supabase on seadistatud ja
          scripts/seed.sql on käivitatud.
        </p>
      )}

      {allParticipants.length === 0 && bonusQuestions.length > 0 && (
        <p className="text-sm text-stone-400">Osalejaid ei ole veel lisatud.</p>
      )}

      {CATEGORIES.map(({ key, title }) => {
        const sectionQuestions = byCategory.get(key) ?? [];
        if (sectionQuestions.length === 0) return null;

        return (
          <section key={key} className="space-y-3">
            <h2 className="section-title border-b-2 border-gold/40 pb-1 text-xl text-navy">
              {title}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {sectionQuestions.map((question, idx) => (
                <BonusCard
                  key={question.id}
                  question={question}
                  index={idx}
                  isJoker={key === "jokker"}
                  participants={allParticipants}
                  answers={allAnswers}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function BonusCard({
  question,
  index,
  isJoker,
  participants,
  answers,
}: {
  question: BonusQuestion;
  index: number;
  isJoker: boolean;
  participants: Participant[];
  answers: BonusAnswer[];
}) {
  return (
    <section
      className={`space-y-2 rounded-sm border border-stone-200 border-t-2 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover ${
        isJoker ? "border-t-gold md:col-span-2" : "border-t-gold/40"
      }`}
    >
      <h3 className="flex items-baseline gap-2 text-sm font-semibold text-navy">
        <span className="section-title text-2xl leading-none text-gold">
          {isJoker ? "★" : index + 1}
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

      {question.description && (
        <div className="whitespace-pre-line rounded-sm bg-stone-50 px-3 py-2 text-xs leading-relaxed text-stone-600">
          {question.description}
        </div>
      )}

      {participants.length > 0 && (
        <div className="overflow-hidden rounded-sm border border-stone-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-left text-xs uppercase text-stone-500">
                <th className="px-2 py-1">Nimi</th>
                <th className="px-2 py-1">{isJoker ? "Valis combo?" : "Vastus"}</th>
                <th className="px-2 py-1 text-center">Punktid</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => {
                const answer = answers.find(
                  (a) =>
                    a.participant_id === participant.id &&
                    a.question_id === question.id
                );

                return (
                  <tr key={participant.id} className="border-t border-stone-100">
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
  );
}
