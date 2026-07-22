"use client";

import { useState } from "react";
import { BonusAnswer, BonusQuestion, Participant } from "@/lib/types";
import Reveal from "@/components/Reveal";
import ToggleAllButton from "@/components/ToggleAllButton";

// Section order + headings for the bonus categories.
const CATEGORIES: { key: string; title: string }[] = [
  { key: "alagrupp", title: "Boonusküsimused - alagrupi mängud" },
  { key: "1/32", title: "Boonusküsimused - 1/32" },
  { key: "jokker", title: "Jokker combo - 1/32" },
  { key: "1/16", title: "Boonusküsimused - 1/16" },
  { key: "qf", title: "Boonusküsimused - veerandfinaal" },
  { key: "jokker-qf", title: "Jokker - veerandfinaal" },
  { key: "sf", title: "Boonusküsimused - poolfinaal" },
  { key: "final", title: "Boonusküsimused - finaal" },
];

export default function BonusAccordion({
  questions,
  participants,
  answers,
}: {
  questions: BonusQuestion[];
  participants: Participant[];
  answers: BonusAnswer[];
}) {
  // All sections start collapsed; the user opens each round on demand.
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const [openQ, setOpenQ] = useState<Set<number>>(() => new Set());

  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const toggleQ = (id: number) =>
    setOpenQ((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Group questions by category, keeping any unknown category in a trailing
  // "alagrupp" bucket so nothing silently disappears.
  const byCategory = new Map<string, BonusQuestion[]>();
  for (const q of questions) {
    const cat =
      q.category && CATEGORIES.some((c) => c.key === q.category)
        ? q.category
        : "alagrupp";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(q);
  }

  const visibleCats = CATEGORIES.filter((c) => (byCategory.get(c.key) ?? []).length);
  const allOpen =
    visibleCats.length > 0 &&
    visibleCats.every((c) => open.has(c.key)) &&
    questions.every((q) => openQ.has(q.id));
  const toggleAll = () => {
    if (allOpen) {
      setOpen(new Set());
      setOpenQ(new Set());
    } else {
      setOpen(new Set(visibleCats.map((c) => c.key)));
      setOpenQ(new Set(questions.map((q) => q.id)));
    }
  };

  return (
    <div className="space-y-3">
      <ToggleAllButton allOpen={allOpen} onToggle={toggleAll} />
      {CATEGORIES.map(({ key, title }) => {
        const sectionQuestions = byCategory.get(key) ?? [];
        if (sectionQuestions.length === 0) return null;
        const isOpen = open.has(key);

        return (
          <Reveal
            key={key}
            className="overflow-hidden rounded-lg border border-line border-t-2 border-t-fifared/50 bg-surface shadow-card transition-shadow hover:shadow-card-hover"
          >
            <button
              type="button"
              onClick={() => toggle(key)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.06]"
            >
              <span className="flex items-baseline gap-2">
                <span className="text-sm font-semibold tracking-tight text-ink">{title}</span>
                <span className="eyebrow">{sectionQuestions.length} küsimust</span>
              </span>
              <span
                className={`text-muted transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>
            {isOpen && (
              <div className="border-t border-line/60 p-3">
                <div className="grid gap-4 md:grid-cols-2">
                  {sectionQuestions.map((question, idx) => (
                    <BonusCard
                      key={question.id}
                      question={question}
                      index={idx}
                      isJoker={key.startsWith("jokker")}
                      participants={participants}
                      answers={answers}
                      open={openQ.has(question.id)}
                      onToggle={() => toggleQ(question.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </Reveal>
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
  open,
  onToggle,
}: {
  question: BonusQuestion;
  index: number;
  isJoker: boolean;
  participants: Participant[];
  answers: BonusAnswer[];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <section
      className={`overflow-hidden rounded-lg border border-line border-t-2 bg-surface shadow-card transition-shadow hover:shadow-card-hover ${
        isJoker ? "border-t-fifared md:col-span-2" : "border-t-fifared/40"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-white/[0.06]"
      >
        <span className="section-title text-2xl leading-none text-fifared">
          {isJoker ? "★" : index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">
            {question.question_text}
          </span>
          <span className="text-[11px] text-muted">
            Maksimum: {question.max_points} punkti
            {question.correct_answer && (
              <>
                {" "}
                · Õige vastus:{" "}
                <span className="font-semibold text-fifared">
                  {question.correct_answer}
                </span>
              </>
            )}
          </span>
        </span>
        <span
          className={`text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="space-y-2 border-t border-line/60 p-3">
          {question.description && (
            <div className="whitespace-pre-line rounded-sm bg-white/[0.04] px-3 py-2 text-xs leading-relaxed text-ink/75">
              {question.description}
            </div>
          )}

          {participants.length > 0 && (
            <div className="overflow-hidden rounded-sm border border-line">
              <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.04] text-left text-xs uppercase text-muted">
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
                  <tr key={participant.id} className="border-t border-line/60">
                    <td className="px-2 py-1 font-medium text-ink">
                      {participant.name}
                    </td>
                    <td className="px-2 py-1 text-ink/75">
                      {answer?.answer_text || "–"}
                    </td>
                    <td className="px-2 py-1 text-center text-ink/75">
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
        </div>
      )}
    </section>
  );
}
