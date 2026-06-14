"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { calcMatchPoints } from "@/lib/scoring";
import { Participant, Match, Prediction, BonusAnswer } from "@/lib/types";

interface Row {
  id: string;
  name: string;
  matchPoints: number;
  bonusPoints: number;
  total: number;
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [
        { data: participants, error: participantsError },
        { data: matches, error: matchesError },
        { data: predictions, error: predictionsError },
        { data: bonusAnswers, error: bonusAnswersError },
      ] = await Promise.all([
        supabase.from("participants").select("*"),
        supabase.from("matches").select("*"),
        supabase.from("predictions").select("*"),
        supabase.from("bonus_answers").select("*"),
      ]);

      const firstError =
        participantsError || matchesError || predictionsError || bonusAnswersError;
      if (firstError) throw firstError;

      const matchById = new Map<number, Match>(
        (matches ?? []).map((m: Match) => [m.id, m])
      );

      const computedRows: Row[] = ((participants ?? []) as Participant[]).map(
        (p) => {
          const matchPoints = ((predictions ?? []) as Prediction[])
            .filter((pred) => pred.participant_id === p.id)
            .reduce((sum, pred) => {
              const match = matchById.get(pred.match_id);
              if (!match) return sum;
              return sum + calcMatchPoints(pred, match);
            }, 0);

          const bonusPoints = ((bonusAnswers ?? []) as BonusAnswer[])
            .filter((ans) => ans.participant_id === p.id)
            .reduce((sum, ans) => sum + (ans.points_awarded ?? 0), 0);

          return {
            id: p.id,
            name: p.name,
            matchPoints,
            bonusPoints,
            total: matchPoints + bonusPoints,
          };
        }
      );

      computedRows.sort(
        (a, b) => b.total - a.total || a.name.localeCompare(b.name)
      );

      setRows(computedRows);
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
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-navy">Edetabel</h2>

      {loading && <p className="text-sm text-slate-400">Laadimine...</p>}

      {!loading && error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!loading && !error && rows.length === 0 && (
        <p className="text-sm text-slate-400">
          Osalejaid ei ole veel lisatud. Admin saab osalejaid lisada admin alas.
        </p>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <th className="px-2 py-2 text-center">#</th>
                <th className="px-2 py-2">Nimi</th>
                <th className="px-2 py-2 text-center">Mäng</th>
                <th className="px-2 py-2 text-center">Boonus</th>
                <th className="px-2 py-2 text-center">Kokku</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`border-t border-slate-100 ${
                    idx === 0 ? "bg-amber-50" : ""
                  }`}
                >
                  <td className="px-2 py-2 text-center font-semibold text-navy">
                    {idx + 1}
                  </td>
                  <td className="px-2 py-2 font-medium text-navy">{row.name}</td>
                  <td className="px-2 py-2 text-center text-slate-600">{row.matchPoints}</td>
                  <td className="px-2 py-2 text-center text-slate-600">{row.bonusPoints}</td>
                  <td className="px-2 py-2 text-center font-bold text-gold">
                    {row.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
