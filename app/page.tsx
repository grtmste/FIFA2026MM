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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(stages.length > 0 ? stages : (["group"] as Stage[])).map((stage, idx) => {
            const isLast = idx === (stages.length > 0 ? stages.length : 1) - 1;

            return (
              <div
                key={stage}
                className={`overflow-hidden rounded-sm border border-stone-200 border-t-2 border-t-gold/50 bg-white shadow-card ${
                  isLast ? "md:col-span-2 xl:col-span-3" : ""
                }`}
              >
                <div className="flex items-baseline justify-between px-4 pt-3 pb-1">
                  <h3 className="section-title text-xl text-navy">
                    {STAGE_TABLE_LABELS[stage]}
                  </h3>
                  {isLast && <span className="eyebrow">Punktide kokkuvõte</span>}
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 text-left text-[10px] uppercase tracking-wider text-stone-400">
                      <th className="px-3 py-2 text-center font-medium">#</th>
                      <th className="px-3 py-2 font-medium">Nimi</th>
                      <th className="px-3 py-2 text-center font-medium">Punktid</th>
                      {isLast && (
                        <>
                          <th className="px-3 py-2 text-center font-medium">Boonus</th>
                          <th className="px-3 py-2 text-center font-medium">Kokku</th>
                        </>
                      )}
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
                        {isLast && (
                          <>
                            <td className="px-3 py-2.5 text-center text-stone-600">
                              {row.bonusPoints}
                            </td>
                            <td className="px-3 py-2.5 text-center font-bold text-navy">
                              {row.total}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

      {selectedId && (
        <ParticipantDetail
          participant={
            rows.find((r) => r.id === selectedId)
              ? { id: selectedId, name: rows.find((r) => r.id === selectedId)!.name }
              : null
          }
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
