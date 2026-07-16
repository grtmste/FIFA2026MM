"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  BonusAnswer,
  BonusQuestion,
  Match,
  Prediction,
  Stage,
  STAGE_LABELS,
} from "@/lib/types";
import { calcMatchPoints } from "@/lib/scoring";
import { formatMatchDate, formatMatchTime } from "@/lib/format";
import { groupColor } from "@/lib/groupColors";

const STAGE_ORDER: Stage[] = ["group", "r32", "r16", "qf", "sf", "third", "final"];

export default function ParticipantDetail({
  participant,
  matches,
  predictions,
  bonusAnswers,
  bonusQuestions,
  onClose,
}: {
  participant: {
    id: string;
    name: string;
    isChampion?: boolean;
    history?: string | null;
    adjustment?: number;
  } | null;
  matches: Match[];
  predictions: Prediction[];
  bonusAnswers: BonusAnswer[];
  bonusQuestions: BonusQuestion[];
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const predById = useMemo(() => {
    const map = new Map<number, Prediction>();
    if (participant) {
      predictions
        .filter((p) => p.participant_id === participant.id)
        .forEach((p) => map.set(p.match_id, p));
    }
    return map;
  }, [predictions, participant]);

  const stageGroups = useMemo(() => {
    const sorted = [...matches].sort((a, b) => {
      const da = a.match_date ?? "";
      const db = b.match_date ?? "";
      if (da !== db) return da < db ? -1 : 1;
      return a.id - b.id;
    });
    return STAGE_ORDER.map((stage) => ({
      stage,
      matches: sorted.filter((m) => m.stage === stage),
    })).filter((g) => g.matches.length > 0);
  }, [matches]);

  const bonusRows = useMemo(() => {
    if (!participant) return [];
    return bonusQuestions.map((q) => {
      const ans = bonusAnswers.find(
        (a) => a.participant_id === participant.id && a.question_id === q.id
      );
      return { question: q, answer: ans };
    });
  }, [bonusQuestions, bonusAnswers, participant]);

  const totals = useMemo(() => {
    let matchPts = 0;
    predById.forEach((pred, matchId) => {
      const match = matches.find((m) => m.id === matchId);
      if (match) matchPts += calcMatchPoints(pred, match);
    });
    const bonusPts =
      bonusRows.reduce((sum, r) => sum + (r.answer?.points_awarded ?? 0), 0) +
      (participant?.adjustment ?? 0);
    return { matchPts, bonusPts, total: matchPts + bonusPts };
  }, [predById, matches, bonusRows, participant]);

  if (!participant || !mounted) return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-navy/40 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="my-4 w-full max-w-2xl overflow-hidden rounded-lg border border-line bg-surface shadow-card-hover"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-line bg-gradient-to-r from-fifared to-fifaorange px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/60">
              Ennustuste ülevaade
            </p>
            <h3 className="flex items-center gap-1.5 text-lg font-bold text-white">
              {participant.name}
              {participant.isChampion && <span title="Maailmameister">🏆</span>}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm bg-white/15 text-white transition-colors hover:bg-white/25"
            aria-label="Sulge"
          >
            ✕
          </button>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-3 gap-px bg-white/[0.06] text-center">
          <Stat label="Mängud" value={totals.matchPts} />
          <Stat label="Boonus" value={totals.bonusPts} />
          <Stat label="Kokku" value={totals.total} highlight />
        </div>

        {/* Results history */}
        {participant.history && (
          <div className="border-b border-line bg-fifared/[0.10] px-4 py-2.5">
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">
              Tulemuste ajalugu
            </p>
            <p className="whitespace-pre-line text-xs leading-relaxed text-ink/75">
              {participant.history}
            </p>
          </div>
        )}

        {/* Match predictions by stage */}
        <div className="max-h-none space-y-4 px-4 py-4">
          {stageGroups.map(({ stage, matches: stageMatches }) => (
            <div key={stage}>
              <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted">
                {STAGE_LABELS[stage]}
              </h4>
              <div className="space-y-1">
                {stageMatches.map((match) => {
                  const pred = predById.get(match.id);
                  const hasResult =
                    match.actual_home_score !== null &&
                    match.actual_away_score !== null;
                  const pts = pred ? calcMatchPoints(pred, match) : 0;
                  return (
                    <div
                      key={match.id}
                      className="flex items-center gap-2 rounded-sm border border-line/60 px-2 py-1.5 text-xs"
                      style={{
                        borderLeft: `3px solid ${groupColor(match.group_name)}`,
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-ink">
                          {match.home_team} – {match.away_team}
                        </div>
                        <div className="text-[10px] text-muted">
                          {formatMatchDate(match.match_date)} ·{" "}
                          {formatMatchTime(match.match_date)}
                        </div>
                      </div>

                      <div className="flex flex-shrink-0 flex-col items-end text-right">
                        <span className="text-[9px] uppercase tracking-wide text-muted">
                          Ennustus
                        </span>
                        <span className="font-bold tabular-nums text-ink">
                          {pred
                            ? `${pred.predicted_home_score} : ${pred.predicted_away_score}`
                            : "–"}
                        </span>
                      </div>

                      <div className="flex w-12 flex-shrink-0 flex-col items-end text-right">
                        <span className="text-[9px] uppercase tracking-wide text-muted">
                          Tulemus
                        </span>
                        <span className="font-semibold tabular-nums text-muted">
                          {hasResult
                            ? `${match.actual_home_score} : ${match.actual_away_score}`
                            : "–"}
                        </span>
                      </div>

                      <PointsBadge
                        points={pts}
                        scored={hasResult && !!pred}
                        exact={
                          hasResult &&
                          !!pred &&
                          pred.predicted_home_score === match.actual_home_score &&
                          pred.predicted_away_score === match.actual_away_score
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Bonus */}
          {bonusRows.length > 0 && (
            <div>
              <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted">
                Boonusküsimused
              </h4>
              <div className="space-y-1">
                {bonusRows.map(({ question, answer }, idx) => (
                  <div
                    key={question.id}
                    className="flex items-center gap-2 rounded-sm border border-line/60 px-2 py-1.5 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-ink">
                        {idx + 1}. {question.question_text}
                      </div>
                      <div className="truncate text-[11px] text-muted">
                        {answer?.answer_text || "–"}
                      </div>
                    </div>
                    <PointsBadge
                      points={answer?.points_awarded ?? 0}
                      scored={answer?.points_awarded != null}
                      max={question.max_points}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="bg-surface py-2.5">
      <div
        className={`text-xl font-bold tabular-nums ${
          highlight ? "text-fifared" : "text-ink"
        }`}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-muted">
        {label}
      </div>
    </div>
  );
}

function PointsBadge({
  points,
  scored,
  max,
  exact,
}: {
  points: number;
  scored: boolean;
  max?: number;
  exact?: boolean;
}) {
  if (!scored) {
    return (
      <span className="flex h-6 w-9 flex-shrink-0 items-center justify-center rounded-sm bg-white/[0.06] text-[11px] font-bold text-muted/50">
        –
      </span>
    );
  }
  // Dark gradient = top tier (exact score, or full points on a bonus
  // question); champagne = partial points; grey = zero.
  const top = exact ?? (max != null && points === max);
  const color =
    points === 0
      ? "bg-white/[0.06] text-muted"
      : top
      ? "bg-gradient-to-br from-fifared to-fifacyan text-white"
      : "bg-fifared/[0.14] text-ink";
  return (
    <span
      className={`flex h-6 min-w-9 flex-shrink-0 items-center justify-center rounded-sm px-1 text-[11px] font-bold tabular-nums ${color}`}
    >
      {max != null ? `${points}/${max}` : `+${points}`}
    </span>
  );
}
