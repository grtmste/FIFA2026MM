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
import LeaderboardTable from "@/components/LeaderboardTable";
import ChampionConfetti from "@/components/ChampionConfetti";
import ToggleAllButton from "@/components/ToggleAllButton";

const STAGE_ORDER: Stage[] = ["group", "r32", "r16", "qf", "sf", "third", "final"];

const STAGE_TABLE_LABELS: Record<Stage, string> = {
  group: "Alagrupi mängud",
  r32: "1/32 finaali mängud",
  r16: "1/16 finaali mängud",
  qf: "Veerandfinaali mängud",
  sf: "Poolfinaali mängud",
  third: "3. koha mäng",
  final: "Finaalmäng",
};

interface Row {
  id: string;
  name: string;
  isChampion: boolean;
  history: string | null;
  adjustment: number;
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
            third: 0,
            final: 0,
          };

          ((predictions ?? []) as Prediction[])
            .filter((pred) => pred.participant_id === p.id)
            .forEach((pred) => {
              const match = matchById.get(pred.match_id);
              if (!match) return;
              stagePoints[match.stage] += calcMatchPoints(pred, match);
            });

          // The admin's manual +/- correction (e.g. Jokker adjustments) is
          // folded into the bonus column so the columns still sum to Kokku.
          const bonusPoints =
            ((bonusAnswers ?? []) as BonusAnswer[])
              .filter((ans) => ans.participant_id === p.id)
              .reduce((sum, ans) => sum + (ans.points_awarded ?? 0), 0) +
            (p.points_adjustment ?? 0);

          const total =
            STAGE_ORDER.reduce((sum, stage) => sum + stagePoints[stage], 0) +
            bonusPoints;

          return {
            id: p.id,
            name: p.name,
            isChampion: p.is_champion ?? false,
            history: p.history ?? null,
            adjustment: p.points_adjustment ?? 0,
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
      <ChampionConfetti
        championId={rows.find((r) => r.isChampion)?.id ?? null}
      />
      <SectionHeading eyebrow="Üldine seis" title="Edetabel" />

      {loading && <p className="text-sm text-muted">Laadimine...</p>}

      {!loading && error && (
        <p className="text-sm text-fifared">{error}</p>
      )}

      {!loading && !error && rows.length === 0 && (
        <p className="text-sm text-muted">
          Osalejaid ei ole veel lisatud. Admin saab osalejaid lisada admin alas.
        </p>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="space-y-3">
          {(() => {
            const keys = ["overall", ...(stages.length > 0 ? stages : ["group"])];
            const allOpen = keys.every((k) => openSections.has(k));
            return (
              <ToggleAllButton
                allOpen={allOpen}
                onToggle={() =>
                  setOpenSections(allOpen ? new Set() : new Set(keys))
                }
              />
            );
          })()}
          {/* ── Overall standings (total) — open by default ── */}
          <Section
            title="Üldine edetabel"
            eyebrow="Punktide kokkuvõte"
            open={openSections.has("overall")}
            onToggle={() => toggleSection("overall")}
            accent
          >
            <LeaderboardTable
              rows={rows}
              onSelect={setSelectedId}
              columns={[
                { label: "Mängud", get: (r) => r.total - r.bonusPoints },
                { label: "Boonus", get: (r) => r.bonusPoints },
                { label: "Kokku", get: (r) => r.total, bold: true },
              ]}
            />
          </Section>

          {/* ── Per-stage breakdown — collapsed by default ── */}
          {(stages.length > 0 ? stages : (["group"] as Stage[])).map((stage) => (
            <Section
              key={stage}
              title={STAGE_TABLE_LABELS[stage]}
              open={openSections.has(stage)}
              onToggle={() => toggleSection(stage)}
            >
              <LeaderboardTable
                rows={rows}
                onSelect={setSelectedId}
                columns={[
                  { label: "Punktid", get: (r) => r.stagePoints[stage] },
                ]}
              />
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
                  adjustment: r.adjustment,
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
      className={`overflow-hidden rounded-lg border border-line border-t-2 bg-surface shadow-card transition-shadow hover:shadow-card-hover ${
        accent ? "border-t-fifared" : "border-t-fifared/50"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.06]"
      >
        <span className="flex items-baseline gap-2">
          <span className="text-sm font-semibold tracking-tight text-ink">{title}</span>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        </span>
        <span
          className={`text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>
      {open && <div className="border-t border-line/60">{children}</div>}
    </Reveal>
  );
}
