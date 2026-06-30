"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { fetchAllRows } from "@/lib/fetchAll";
import { calcMatchPoints } from "@/lib/scoring";
import {
  Participant,
  Match,
  Prediction,
  BonusAnswer,
  BonusQuestion,
  Stage,
} from "@/lib/types";
import SectionHeading from "@/components/SectionHeading";
import ParticipantDetail from "@/components/ParticipantDetail";
import Reveal from "@/components/Reveal";

const STAGE_ORDER: Stage[] = ["group", "r32", "r16", "qf", "sf", "final"];

const STAGE_TABLE_LABELS: Record<Stage, string> = {
  group: "Alagrupi mängud",
  r32: "1/32 finaali mängud",
  r16: "1/16 finaali mängud",
  qf: "Veerandfinaali mängud",
  sf: "Poolfinaali mängud",
  final: "Finaalmäng",
};

interface Row {
  id: string;
  name: string;
  isChampion: boolean;
  history: string | null;
  stagePoints: Record<Stage, number>;
  bonusPoints: number;
  total: number;
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [allPredictions, setAllPredictions] = useState<Prediction[]>([]);
  const [allBonusAnswers, setAllBonusAnswers] = useState<BonusAnswer[]>([]);
  const [allBonusQuestions, setAllBonusQuestions] = useState<BonusQuestion[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Which leaderboard sections are expanded. The overall standings start open;
  // each stage starts collapsed.
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(["overall"])
  );

  const toggleSection = (key: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const loadData = useCallback(async () => {
    try {
      const [
        { data: participants, error: participantsError },
        { data: matches, error: matchesError },
        predictions,
        bonusAnswers,
        { data: bonusQuestions, error: bonusQuestionsError },
      ] = await Promise.all([
        supabase.from("participants").select("*"),
        supabase.from("matches").select("*"),
        fetchAllRows<Prediction>(supabase, "predictions"),
        fetchAllRows<BonusAnswer>(supabase, "bonus_answers"),
        supabase.from("bonus_questions").select("*").order("id", { ascending: true }),
      ]);

      const firstError = participantsError || matchesError || bonusQuestionsError;
      if (firstError) throw firstError;

      const matchById = new Map<number, Match>(
        (matches ?? []).map((m: Match) => [m.id, m])
      );

      const stagesWithMatches = STAGE_ORDER.filter((stage) =>
        ((matches ?? []) as Match[]).some((m) => m.stage === stage)
      );

      const computedRows: Row[] = ((participants ?? []) as Participant[]).map(
        (p) => {
          const stagePoints: Record<Stage, number> = {
            group: 0,
            r32: 0,
            r16: 0,
            qf: 0,
            sf: 0,
            final: 0,
          };

          ((predictions ?? []) as Prediction[])
            .filter((pred) => pred.participant_id === p.id)
            .forEach((pred) => {
              const match = matchById.get(pred.match_id);
              if (!match) return;
              stagePoints[match.stage] += calcMatchPoints(pred, match);
            });

          const bonusPoints = ((bonusAnswers ?? []) as BonusAnswer[])
            .filter((ans) => ans.participant_id === p.id)
            .reduce((sum, ans) => sum + (ans.points_awarded ?? 0), 0);

          const total =
            STAGE_ORDER.reduce((sum, stage) => sum + stagePoints[stage], 0) +
            bonusPoints;

          return {
            id: p.id,
            name: p.name,
            isChampion: p.is_champion ?? false,
            history: p.history ?? null,
            stagePoints,
            bonusPoints,
            total,
          };
        }
      );

      computedRows.sort(
        (a, b) => b.total - a.total || a.name.localeCompare(b.name)
      );

      setRows(computedRows);
      setStages(stagesWithMatches);
      setAllMatches((matches ?? []) as Match[]);
      setAllPredictions(predictions as Prediction[]);
      setAllBonusAnswers(bonusAnswers as BonusAnswer[]);
      setAllBonusQuestions((bonusQuestions ?? []) as BonusQuestion[]);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(
        "Andmete laadimine ebaõnnestus. Kontrolli, et Supabase on seadistatud ja andmebaas on ettevalmistatud."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("leaderboard-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, loadData)
      .on("postgres_changes", { event: "*", schema: "public", table: "predictions" }, loadData)
      .on("postgres_changes", { event: "*", schema: "public", table: "bonus_answers" }, loadData)
      .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  return (
    <div className="space-y-5">
      <SectionHeading eyebrow="Üldine seis" title="Edetabel" />

      {loading && <p className="text-sm text-stone-400">Laadimine...</p>}

      {!loading && error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!loading && !error && rows.length === 0 && (
        <p className="text-sm text-stone-400">
          Osalejaid ei ole veel lisatud. Admin saab osalejaid lisada admin alas.
        </p>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="space-y-3">
          {/* ── Overall standings (total) — open by default ── */}
          <Section
            title="Üldine edetabel"
            eyebrow="Punktide kokkuvõte"
            open={openSections.has("overall")}
            onToggle={() => toggleSection("overall")}
            accent
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-[10px] uppercase tracking-wider text-stone-400">
                  <th className="px-3 py-2 text-center font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Nimi</th>
                  <th className="px-3 py-2 text-center font-medium">Mängud</th>
                  <th className="px-3 py-2 text-center font-medium">Boonus</th>
                  <th className="px-3 py-2 text-center font-medium">Kokku</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr
                    key={row.id}
                    className={`border-t border-stone-100 transition-colors ${
                      rowIdx === 0 ? "bg-champagne/60" : "hover:bg-stone-50/60"
                    }`}
                  >
                    <td className="px-3 py-2.5 text-center font-semibold text-gold">
                      {rowIdx + 1}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-navy">
                      <button
                        type="button"
                        onClick={() => setSelectedId(row.id)}
                        className="text-left underline decoration-stone-300 decoration-dotted underline-offset-2 transition-colors hover:text-gold hover:decoration-gold"
                      >
                        {row.name}
                        {row.isChampion && (
                          <span title="Maailmameister"> 🏆</span>
                        )}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-center text-stone-600">
                      {row.total - row.bonusPoints}
                    </td>
                    <td className="px-3 py-2.5 text-center text-stone-600">
                      {row.bonusPoints}
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-navy">
                      {row.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* ── Per-stage breakdown — collapsed by default ── */}
          {(stages.length > 0 ? stages : (["group"] as Stage[])).map((stage) => (
            <Section
              key={stage}
              title={STAGE_TABLE_LABELS[stage]}
              open={openSections.has(stage)}
              onToggle={() => toggleSection(stage)}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-left text-[10px] uppercase tracking-wider text-stone-400">
                    <th className="px-3 py-2 text-center font-medium">#</th>
                    <th className="px-3 py-2 font-medium">Nimi</th>
                    <th className="px-3 py-2 text-center font-medium">Punktid</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIdx) => (
                    <tr
                      key={row.id}
                      className={`border-t border-stone-100 transition-colors ${
                        rowIdx === 0 ? "bg-champagne/60" : "hover:bg-stone-50/60"
                      }`}
                    >
                      <td className="px-3 py-2.5 text-center font-semibold text-gold">
                        {rowIdx + 1}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-navy">
                        <button
                          type="button"
                          onClick={() => setSelectedId(row.id)}
                          className="text-left underline decoration-stone-300 decoration-dotted underline-offset-2 transition-colors hover:text-gold hover:decoration-gold"
                        >
                          {row.name}
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-center text-stone-600">
                        {row.stagePoints[stage]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          ))}
        </div>
      )}

      {selectedId && (
        <ParticipantDetail
          participant={(() => {
            const r = rows.find((row) => row.id === selectedId);
            return r
              ? {
                  id: r.id,
                  name: r.name,
                  isChampion: r.isChampion,
                  history: r.history,
                }
              : null;
          })()}
          matches={allMatches}
          predictions={allPredictions}
          bonusAnswers={allBonusAnswers}
          bonusQuestions={allBonusQuestions}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

function Section({
  title,
  eyebrow,
  open,
  onToggle,
  accent,
  children,
}: {
  title: string;
  eyebrow?: string;
  open: boolean;
  onToggle: () => void;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Reveal
      className={`overflow-hidden rounded-lg border border-stone-200/70 border-t-2 bg-white shadow-card transition-shadow hover:shadow-card-hover ${
        accent ? "border-t-gold" : "border-t-gold/50"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-stone-50/60"
      >
        <span className="flex items-baseline gap-2">
          <span className="text-sm font-semibold tracking-tight text-navy">{title}</span>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        </span>
        <span
          className={`text-stone-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>
      {open && <div className="border-t border-stone-100">{children}</div>}
    </Reveal>
  );
}
