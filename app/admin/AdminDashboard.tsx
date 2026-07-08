"use client";

import { useMemo, useRef, useState } from "react";
import {
  BonusAnswer,
  BonusQuestion,
  Match,
  Participant,
  Prediction,
} from "@/lib/types";
import { groupColor } from "@/lib/groupColors";
import { calcMatchPoints } from "@/lib/scoring";
import { formatMatchDate, formatMatchTime } from "@/lib/format";
import SubmitButton from "@/components/SubmitButton";
import {
  addParticipant,
  advanceBracket,
  deleteParticipant,
  importPredictionPdf,
  saveAllPredictions,
  saveBonusAnswer,
  saveBonusCorrectAnswer,
  saveMatchResult,
  savePointsOverride,
  updateParticipant,
} from "./actions";

type Tab = "participants" | "predictions" | "results" | "bonus";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "participants", label: "Osalejad", icon: "👥" },
  { id: "predictions", label: "Ennustused", icon: "🎯" },
  { id: "results", label: "Tulemused", icon: "⚽" },
  { id: "bonus", label: "Boonused", icon: "⭐" },
];

const INPUT =
  "rounded-sm border border-stone-200 bg-white text-navy transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";

const SCORE_INPUT = `w-12 px-1 py-1.5 text-center text-sm font-semibold ${INPUT}`;

export default function AdminDashboard({
  participants,
  matches,
  predictions,
  bonusQuestions,
  bonusAnswers,
}: {
  participants: Participant[];
  matches: Match[];
  predictions: Prediction[];
  bonusQuestions: BonusQuestion[];
  bonusAnswers: BonusAnswer[];
}) {
  const [tab, setTab] = useState<Tab>("participants");
  const [selectedParticipantId, setSelectedParticipantId] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-sm border border-stone-200 bg-stone-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-sm px-2 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 ${
              tab === t.id
                ? "bg-white text-navy shadow-sm"
                : "text-stone-500 hover:text-navy"
            }`}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <div key={tab} className="animate-fade-in-up">
        {tab === "participants" && (
          <ParticipantsTab
            participants={participants}
            matches={matches}
            predictions={predictions}
          />
        )}

        {tab === "predictions" && (
          <PredictionsTab
            participants={participants}
            matches={matches}
            predictions={predictions}
          />
        )}

        {tab === "results" && <ResultsTab allMatches={matches} />}

        {tab === "bonus" && (
          <BonusTab
            participants={participants}
            bonusQuestions={bonusQuestions}
            bonusAnswers={bonusAnswers}
            selectedParticipantId={selectedParticipantId}
            onSelectParticipant={setSelectedParticipantId}
          />
        )}
      </div>
    </div>
  );
}

function ParticipantsTab({
  participants,
  matches,
  predictions,
}: {
  participants: Participant[];
  matches: Match[];
  predictions: Prediction[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <form
        action={addParticipant}
        className="flex gap-2 rounded-sm border border-stone-200 bg-white p-3 shadow-card"
      >
        <input
          type="text"
          name="name"
          placeholder="Uue osaleja nimi"
          required
          className={`flex-1 px-3 py-2 text-sm placeholder-stone-400 ${INPUT}`}
        />
        <SubmitButton variant="primary" className="px-4 py-2 text-sm" successLabel="Lisatud">
          + Lisa
        </SubmitButton>
      </form>

      {participants.length === 0 ? (
        <p className="text-sm text-stone-400">Osalejaid ei ole veel lisatud.</p>
      ) : (
        <div className="space-y-2">
          {participants.map((p) => {
            const open = expandedId === p.id;
            return (
              <div
                key={p.id}
                className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-card"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(open ? null : p.id)}
                  className="flex w-full items-center justify-between gap-2 p-3 text-left transition-colors hover:bg-stone-50/60"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-gradient-to-br from-navy to-blue-600 text-sm font-bold text-white">
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-navy">
                      {p.name}
                      {p.is_champion && <span title="Maailmameister">🏆</span>}
                    </span>
                  </span>
                  <span
                    className={`text-stone-400 transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>

                {open && (
                  <div className="space-y-3 border-t border-stone-100 p-3">
                    <form action={updateParticipant} className="space-y-2.5">
                      <input type="hidden" name="id" value={p.id} />
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                          Nimi
                        </span>
                        <input
                          type="text"
                          name="name"
                          defaultValue={p.name}
                          className={`w-full px-3 py-2 text-sm ${INPUT}`}
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                          Tulemuste ajalugu (MM-id, EM-id)
                        </span>
                        <textarea
                          name="history"
                          rows={3}
                          defaultValue={p.history ?? ""}
                          placeholder="nt 2022 MM – 3. koht, 2021 EM – võitja"
                          className={`w-full resize-y px-3 py-2 text-sm ${INPUT}`}
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                          Punktide korrektsioon (+/-)
                        </span>
                        <input
                          type="number"
                          name="points_adjustment"
                          step={1}
                          defaultValue={p.points_adjustment ?? 0}
                          className={`w-28 px-3 py-2 text-sm ${INPUT}`}
                        />
                        <span className="mt-1 block text-[11px] text-stone-400">
                          Liidetakse osaleja kogusummale edetabelis (nt Jokkeri
                          korrektsioonid). Võib olla negatiivne.
                        </span>
                      </label>

                      <label className="flex items-center gap-2 text-sm font-medium text-navy">
                        <input
                          type="checkbox"
                          name="is_champion"
                          defaultChecked={p.is_champion ?? false}
                          className="h-4 w-4 accent-gold"
                        />
                        🏆 Võitja staatus (maailmameister)
                      </label>

                      <SubmitButton
                        variant="primary"
                        className="px-4 py-2 text-xs"
                        successLabel="Salvestatud"
                      >
                        Salvesta
                      </SubmitButton>
                    </form>

                    <ParticipantPoints
                      participantId={p.id}
                      matches={matches}
                      predictions={predictions}
                    />

                    <form
                      action={deleteParticipant}
                      className="border-t border-stone-100 pt-2.5"
                    >
                      <input type="hidden" name="id" value={p.id} />
                      <SubmitButton variant="danger" className="px-3 py-2 text-xs">
                        Kustuta osaleja
                      </SubmitButton>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MatchLabel({ match }: { match: Match }) {
  return (
    <div className="flex flex-1 items-center gap-2 text-xs">
      {match.group_name && (
        <span
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-sm text-[11px] font-bold text-navy/80"
          style={{ backgroundColor: groupColor(match.group_name) }}
        >
          {match.group_name}
        </span>
      )}
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-semibold text-navy">
          {match.home_team} – {match.away_team}
        </span>
        <span className="text-[10px] text-stone-400">
          {formatMatchDate(match.match_date)} · {formatMatchTime(match.match_date)}
        </span>
      </div>
    </div>
  );
}

const STAGE_PRED_LABEL: Record<string, string> = {
  group: "Alagrupi ennustused",
  r32: "1/32 ennustused",
  r16: "1/16 ennustused",
  qf: "Veerandfinaali ennustused",
  sf: "Poolfinaali ennustused",
  final: "Finaali ennustused",
};

function PredictionsTab({
  participants,
  matches,
  predictions,
}: {
  participants: Participant[];
  matches: Match[];
  predictions: Prediction[];
}) {
  const [stage, setStage] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const matchesByStage = useMemo(() => {
    const map = new Map<string, Match[]>();
    matches.forEach((m) => {
      if (!map.has(m.stage)) map.set(m.stage, []);
      map.get(m.stage)!.push(m);
    });
    for (const list of map.values()) {
      list.sort((a, b) => {
        const da = a.match_date ?? "";
        const db = b.match_date ?? "";
        if (da !== db) return da < db ? -1 : 1;
        return a.id - b.id;
      });
    }
    return map;
  }, [matches]);

  const stageMatches = stage ? matchesByStage.get(stage) ?? [] : [];
  const stageMatchIds = useMemo(
    () => new Set(stageMatches.map((m) => m.id)),
    [stageMatches]
  );

  const predictionByMatch = useMemo(() => {
    const map = new Map<number, Prediction>();
    if (!viewingId) return map;
    predictions
      .filter((p) => p.participant_id === viewingId)
      .forEach((p) => map.set(p.match_id, p));
    return map;
  }, [predictions, viewingId]);

  // Predictions filled per participant, scoped to the selected stage.
  const predictionCount = useMemo(() => {
    const counts = new Map<string, number>();
    predictions.forEach((p) => {
      if (!stageMatchIds.has(p.match_id)) return;
      counts.set(p.participant_id, (counts.get(p.participant_id) ?? 0) + 1);
    });
    return counts;
  }, [predictions, stageMatchIds]);

  const viewingParticipant = participants.find((p) => p.id === viewingId);

  // ── Step 0: stage selection ──
  if (!stage) {
    return (
      <div className="space-y-2">
        <p className="eyebrow">Vali voor ennustuste sisestamiseks</p>
        {STAGE_ORDER.map((s) => {
          const count = matchesByStage.get(s)?.length ?? 0;
          return (
            <button
              key={s}
              type="button"
              disabled={count === 0}
              onClick={() => setStage(s)}
              className="flex w-full items-center justify-between gap-2 rounded-sm border border-stone-200 bg-white p-3 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-card-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <span className="text-sm font-semibold text-navy">
                {STAGE_PRED_LABEL[s]}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-stone-400">{count} mängu</span>
                <span className="text-stone-300">›</span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // ── Step 1: participant selection (within a stage) ──
  if (!viewingId || !viewingParticipant) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStage(null)}
            className="flex items-center gap-1.5 rounded-sm border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-600 shadow-sm transition-colors hover:bg-stone-50"
          >
            ‹ Voorud
          </button>
          <h3 className="flex-1 truncate text-base font-bold text-navy">
            {STAGE_PRED_LABEL[stage]}
          </h3>
        </div>
        {participants.length === 0 ? (
          <p className="text-sm text-stone-400">Osalejaid ei ole veel lisatud.</p>
        ) : (
          participants.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setViewingId(p.id)}
              className="flex w-full items-center justify-between gap-2 rounded-sm border border-stone-200 bg-white p-3 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-card-hover active:scale-[0.99]"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-gradient-to-br from-navy to-blue-600 text-sm font-bold text-white">
                  {p.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-semibold text-navy">{p.name}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-stone-400">
                  {predictionCount.get(p.id) ?? 0}/{stageMatches.length}
                </span>
                <span className="text-stone-300">›</span>
              </span>
            </button>
          ))
        )}
      </div>
    );
  }

  // ── Step 2: single participant prediction-entry view ──
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setViewingId(null)}
          className="flex items-center gap-1.5 rounded-sm border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-600 shadow-sm transition-colors hover:bg-stone-50"
        >
          ‹ Tagasi
        </button>
        <h3 className="flex-1 truncate text-base font-bold text-navy">
          {viewingParticipant.name}
          <span className="ml-1.5 text-xs font-normal text-stone-400">
            · {STAGE_PRED_LABEL[stage]}
          </span>
        </h3>
        <a
          href={`/pdf/${viewingId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-sm border border-gold bg-gold px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-gold-dark"
        >
          🖨️ PDF
        </a>
      </div>

      <PredictionsForm
        key={`${stage}-${viewingId}`}
        participantId={viewingId}
        stageMatches={stageMatches}
        stageMatchIds={stageMatchIds}
        predictionByMatch={predictionByMatch}
      />
    </div>
  );
}

function PredictionsForm({
  participantId,
  stageMatches,
  stageMatchIds,
  predictionByMatch,
}: {
  participantId: string;
  stageMatches: Match[];
  stageMatchIds: Set<number>;
  predictionByMatch: Map<number, Prediction>;
}) {
  const [scores, setScores] = useState<Record<number, { home: string; away: string }>>(
    () => {
      const init: Record<number, { home: string; away: string }> = {};
      stageMatches.forEach((m) => {
        const existing = predictionByMatch.get(m.id);
        init[m.id] = {
          home: existing?.predicted_home_score?.toString() ?? "",
          away: existing?.predicted_away_score?.toString() ?? "",
        };
      });
      return init;
    }
  );
  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function updateScore(matchId: number, field: "home" | "away", value: string) {
    setScores((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], [field]: value },
    }));
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setImportMsg(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await importPredictionPdf(formData);
      if (!result.ok) {
        setImportMsg({ ok: false, text: result.error });
        return;
      }
      // Only merge scores that belong to this stage's matches, so importing a
      // sheet while a different round is open can't inject stray predictions.
      const relevant = result.scores.filter((s) => stageMatchIds.has(s.match_id));
      setScores((prev) => {
        const next = { ...prev };
        relevant.forEach(({ match_id, home, away }) => {
          next[match_id] = { home: String(home), away: String(away) };
        });
        return next;
      });
      if (relevant.length === 0) {
        setImportMsg({
          ok: false,
          text: "Selle vooru mänge PDF-ist ei leitud. Kontrolli, et tegu on õige vooru lehega.",
        });
        return;
      }
      setImportMsg({
        ok: true,
        text: `Imporditud ${relevant.length} skoori. Kontrolli ja vajuta "Salvesta kõik".`,
      });
    } catch (err) {
      setImportMsg({
        ok: false,
        text: err instanceof Error ? err.message : "PDF-i import ebaõnnestus.",
      });
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  }

  async function handleSaveAll() {
    setIsSaving(true);
    setSaveMsg(null);
    try {
      const formData = new FormData();
      formData.set("participant_id", participantId);
      formData.set(
        "scores",
        JSON.stringify(
          Object.entries(scores).map(([matchId, v]) => ({
            match_id: Number(matchId),
            ...v,
          }))
        )
      );
      const result = await saveAllPredictions(formData);
      if (!result.ok) {
        setSaveMsg({ ok: false, text: result.error });
        return;
      }
      setSaved(true);
      setSaveMsg({ ok: true, text: `Salvestatud ${result.saved} ennustust.` });
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveMsg({
        ok: false,
        text: err instanceof Error ? err.message : "Salvestamine ebaõnnestus.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="space-y-1.5">
        <label className="flex w-fit cursor-pointer items-center gap-1.5 rounded-sm border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-navy shadow-sm transition-colors hover:bg-stone-50">
          {isImporting ? "Laen..." : "📥 Impordi PDF"}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleImport}
            disabled={isImporting}
            className="hidden"
          />
        </label>
        {importMsg && (
          <p
            className={`text-xs ${
              importMsg.ok ? "text-green-600" : "text-red-500"
            }`}
          >
            {importMsg.text}
          </p>
        )}
      </div>

      {stageMatches.map((match) => (
        <div
          key={match.id}
          className="rounded-sm border border-stone-200 bg-white p-2.5 shadow-card transition-shadow hover:shadow-card-hover"
        >
          <div className="flex w-full flex-col gap-1.5 md:flex-row md:items-center md:gap-2">
            <MatchLabel match={match} />
            <div className="flex flex-shrink-0 items-center justify-end gap-2 md:justify-start">
              <input
                type="number"
                min={0}
                value={scores[match.id]?.home ?? ""}
                onChange={(e) => updateScore(match.id, "home", e.target.value)}
                className={SCORE_INPUT}
              />
              <span className="text-xs font-bold text-stone-300">:</span>
              <input
                type="number"
                min={0}
                value={scores[match.id]?.away ?? ""}
                onChange={(e) => updateScore(match.id, "away", e.target.value)}
                className={SCORE_INPUT}
              />
            </div>
          </div>
        </div>
      ))}

      <div className="sticky bottom-2 space-y-1">
        {saveMsg && (
          <p
            className={`rounded-sm px-3 py-1.5 text-xs font-medium ${
              saveMsg.ok
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {saveMsg.text}
          </p>
        )}
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="w-full rounded-sm bg-navy px-4 py-3 text-sm font-bold text-white shadow-card-hover transition-colors hover:bg-navy/90 disabled:opacity-60"
        >
          {saved ? "✓ Salvestatud!" : isSaving ? "Salvestamine..." : "💾 Salvesta kõik"}
        </button>
      </div>
    </div>
  );
}

const STAGE_ORDER = ["group", "r32", "r16", "qf", "sf", "final"] as const;
const STAGE_LABEL: Record<string, string> = {
  group: "Alagrupi mängud",
  r32: "1/32 finaali mängud",
  r16: "1/16 finaali mängud",
  qf: "Veerandfinaali mängud",
  sf: "Poolfinaali mängud",
  final: "Finaalmäng",
};

function ResultsTab({ allMatches }: { allMatches: Match[] }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="space-y-3">
      {/* Advance bracket button */}
      <form action={advanceBracket}>
        <SubmitButton variant="primary" className="px-4 py-2 text-sm" successLabel="Uuendatud!">
          ⚡ Uuenda järgmine voor
        </SubmitButton>
        <p className="mt-1 text-[11px] text-stone-400">
          Arvutab alagrupi seisud ja täidab järgmised voorud automaatselt.
        </p>
      </form>

      {STAGE_ORDER.map((stage) => {
        const stageMatches = allMatches.filter((m) => m.stage === stage);
        if (stageMatches.length === 0) return null;
        const isOpen = open.has(stage);
        return (
          <div
            key={stage}
            className="overflow-hidden rounded-sm border border-stone-200 border-t-2 border-t-gold/50 bg-white shadow-card"
          >
            <button
              type="button"
              onClick={() => toggle(stage)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-stone-50/60"
            >
              <span className="flex items-baseline gap-2">
                <span className="text-sm font-semibold tracking-tight text-navy">
                  {STAGE_LABEL[stage]}
                </span>
                <span className="eyebrow">{stageMatches.length} mängu</span>
              </span>
              <span
                className={`text-stone-400 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>
            {isOpen && (
              <div className="space-y-2 border-t border-stone-100 p-3">
                {stageMatches.map((match) => (
              <form
                key={match.id}
                action={saveMatchResult}
                className="rounded-sm border border-stone-200 bg-white p-2.5 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <input type="hidden" name="match_id" value={match.id} />
                <div className="flex w-full flex-col gap-1.5 md:flex-row md:items-center md:gap-2">
                  <MatchLabel match={match} />
                  <div className="flex flex-shrink-0 items-center justify-end gap-2 md:justify-start">
                    <input
                      type="number"
                      name="actual_home_score"
                      min={0}
                      defaultValue={match.actual_home_score ?? ""}
                      className={SCORE_INPUT}
                    />
                    <span className="text-xs font-bold text-stone-300">:</span>
                    <input
                      type="number"
                      name="actual_away_score"
                      min={0}
                      defaultValue={match.actual_away_score ?? ""}
                      className={SCORE_INPUT}
                    />
                    <SubmitButton variant="outline" className="px-3 py-1.5 text-xs">OK</SubmitButton>
                  </div>
                </div>
                {stage !== "group" && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-1.5">
                    <select
                      name="decision"
                      defaultValue={
                        match.penalty_winner
                          ? `pen_${match.penalty_winner}`
                          : match.extra_time_winner
                          ? `et_${match.extra_time_winner}`
                          : ""
                      }
                      className={`min-w-[180px] flex-1 px-2 py-1 text-xs ${INPUT}`}
                    >
                      <option value="">Otsustati normaalajal</option>
                      <option value="et_home">Lisaajaga võitis {match.home_team}</option>
                      <option value="et_away">Lisaajaga võitis {match.away_team}</option>
                      <option value="pen_home">Penaltitega võitis {match.home_team}</option>
                      <option value="pen_away">Penaltitega võitis {match.away_team}</option>
                    </select>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-stone-400">
                        Lisaaeg:
                      </span>
                      <input
                        type="number"
                        name="extra_time_home_score"
                        min={0}
                        defaultValue={match.extra_time_home_score ?? ""}
                        className="w-11 px-1 py-1 text-center text-xs font-semibold rounded-sm border border-stone-200 bg-white text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                      />
                      <span className="text-xs font-bold text-stone-300">:</span>
                      <input
                        type="number"
                        name="extra_time_away_score"
                        min={0}
                        defaultValue={match.extra_time_away_score ?? ""}
                        className="w-11 px-1 py-1 text-center text-xs font-semibold rounded-sm border border-stone-200 bg-white text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-stone-400">
                        Penaltid:
                      </span>
                      <input
                        type="number"
                        name="penalty_home_score"
                        min={0}
                        defaultValue={match.penalty_home_score ?? ""}
                        className="w-11 px-1 py-1 text-center text-xs font-semibold rounded-sm border border-stone-200 bg-white text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                      />
                      <span className="text-xs font-bold text-stone-300">:</span>
                      <input
                        type="number"
                        name="penalty_away_score"
                        min={0}
                        defaultValue={match.penalty_away_score ?? ""}
                        className="w-11 px-1 py-1 text-center text-xs font-semibold rounded-sm border border-stone-200 bg-white text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                      />
                    </div>
                  </div>
                )}
              </form>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const BONUS_CATS: { key: string; title: string }[] = [
  { key: "alagrupp", title: "Boonusküsimused - alagrupi mängud" },
  { key: "1/32", title: "Boonusküsimused - 1/32" },
  { key: "jokker", title: "Jokker combo - 1/32" },
  { key: "1/16", title: "Boonusküsimused - 1/16" },
  { key: "qf", title: "Boonusküsimused - veerandfinaal" },
  { key: "jokker-qf", title: "Jokker - veerandfinaal" },
];

function bonusCategoryOf(q: BonusQuestion): string {
  return q.category && BONUS_CATS.some((c) => c.key === q.category)
    ? q.category
    : "alagrupp";
}

function BonusTab({
  participants,
  bonusQuestions,
  bonusAnswers,
  selectedParticipantId,
  onSelectParticipant,
}: {
  participants: Participant[];
  bonusQuestions: BonusQuestion[];
  bonusAnswers: BonusAnswer[];
  selectedParticipantId: string;
  onSelectParticipant: (id: string) => void;
}) {
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const answerByQuestion = useMemo(() => {
    const map = new Map<number, BonusAnswer>();
    bonusAnswers
      .filter((a) => a.participant_id === selectedParticipantId)
      .forEach((a) => map.set(a.question_id, a));
    return map;
  }, [bonusAnswers, selectedParticipantId]);

  const grouped = useMemo(() => {
    const map = new Map<string, BonusQuestion[]>();
    bonusQuestions.forEach((q) => {
      const cat = bonusCategoryOf(q);
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(q);
    });
    return map;
  }, [bonusQuestions]);

  const selectedParticipant = participants.find(
    (p) => p.id === selectedParticipantId
  );

  // ── Correct-answers editor (collapsible, global) ──
  const correctAnswers = (
    <div className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-card">
      <button
        type="button"
        onClick={() => toggle("correct")}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-stone-50/60"
      >
        <span className="text-sm font-semibold tracking-tight text-navy">
          ⭐ Õiged vastused
        </span>
        <span
          className={`text-stone-400 transition-transform duration-200 ${
            open.has("correct") ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>
      {open.has("correct") && (
        <div className="space-y-2.5 border-t border-stone-100 p-3">
          {bonusQuestions.map((q, idx) => (
            <form key={q.id} action={saveBonusCorrectAnswer} className="flex items-center gap-2">
              <input type="hidden" name="question_id" value={q.id} />
              <span className="flex-1 text-xs text-stone-600">
                {idx + 1}. {q.question_text}
              </span>
              <input
                type="text"
                name="correct_answer"
                defaultValue={q.correct_answer ?? ""}
                placeholder="Õige vastus"
                className={`w-28 px-2 py-1.5 text-xs ${INPUT}`}
              />
              <SubmitButton variant="outline" className="px-3 py-1.5 text-xs">
                OK
              </SubmitButton>
            </form>
          ))}
        </div>
      )}
    </div>
  );

  // ── Step 0: participant list ──
  if (!selectedParticipant) {
    return (
      <div className="space-y-3">
        {correctAnswers}
        {participants.length === 0 ? (
          <p className="text-sm text-stone-400">Osalejaid ei ole veel lisatud.</p>
        ) : (
          <div className="space-y-2">
            <p className="eyebrow">Vali osaleja vastuste sisestamiseks</p>
            {participants.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectParticipant(p.id)}
                className="flex w-full items-center justify-between gap-2 rounded-sm border border-stone-200 bg-white p-3 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-card-hover active:scale-[0.99]"
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-gradient-to-br from-navy to-blue-600 text-sm font-bold text-white">
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold text-navy">{p.name}</span>
                </span>
                <span className="text-stone-300">›</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Step 1: selected participant → category accordions ──
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSelectParticipant("")}
          className="flex items-center gap-1.5 rounded-sm border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-600 shadow-sm transition-colors hover:bg-stone-50"
        >
          ‹ Osalejad
        </button>
        <h3 className="flex-1 truncate text-base font-bold text-navy">
          {selectedParticipant.name}
        </h3>
      </div>

      {BONUS_CATS.map(({ key, title }) => {
        const qs = grouped.get(key) ?? [];
        if (qs.length === 0) return null;
        const isOpen = open.has(key);
        return (
          <div
            key={key}
            className="overflow-hidden rounded-sm border border-stone-200 border-t-2 border-t-gold/50 bg-white shadow-card"
          >
            <button
              type="button"
              onClick={() => toggle(key)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-stone-50/60"
            >
              <span className="flex items-baseline gap-2">
                <span className="text-sm font-semibold tracking-tight text-navy">{title}</span>
                <span className="eyebrow">{qs.length} küsimust</span>
              </span>
              <span
                className={`text-stone-400 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>
            {isOpen && (
              <div className="space-y-2 border-t border-stone-100 p-3">
                {qs.map((q, idx) => {
                  const existing = answerByQuestion.get(q.id);
                  return (
                    <form
                      key={`${selectedParticipantId}-${q.id}`}
                      action={saveBonusAnswer}
                      className="space-y-2.5 rounded-sm border border-stone-200 bg-white p-3 shadow-card transition-shadow hover:shadow-card-hover"
                    >
                      <input type="hidden" name="participant_id" value={selectedParticipantId} />
                      <input type="hidden" name="question_id" value={q.id} />
                      <p className="text-xs font-semibold text-navy">
                        {idx + 1}. {q.question_text}{" "}
                        <span className="font-normal text-stone-400">({q.max_points} p)</span>
                      </p>
                      <input
                        type="text"
                        name="answer_text"
                        defaultValue={existing?.answer_text ?? ""}
                        placeholder="Osaleja vastus"
                        className={`w-full px-2.5 py-2 text-sm ${INPUT}`}
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-stone-500">Punktid:</label>
                        <input
                          type="number"
                          name="points_awarded"
                          min={0}
                          max={q.max_points}
                          defaultValue={existing?.points_awarded ?? ""}
                          className={`w-20 px-2 py-1.5 text-center text-sm ${INPUT}`}
                        />
                        <SubmitButton
                          variant="primary"
                          className="ml-auto px-4 py-1.5 text-xs"
                          successLabel="Salvestatud"
                        >
                          Salvesta
                        </SubmitButton>
                      </div>
                    </form>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Per-match points editor inside a participant's panel: rounds as collapsible
// groups, each game showing the prediction, result and points, with an
// optional manual override (empty = automatic scoring).
function ParticipantPoints({
  participantId,
  matches,
  predictions,
}: {
  participantId: string;
  matches: Match[];
  predictions: Prediction[];
}) {
  const [openStages, setOpenStages] = useState<Set<string>>(() => new Set());
  const toggle = (key: string) =>
    setOpenStages((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const predByMatch = useMemo(() => {
    const map = new Map<number, Prediction>();
    predictions
      .filter((pr) => pr.participant_id === participantId)
      .forEach((pr) => map.set(pr.match_id, pr));
    return map;
  }, [predictions, participantId]);

  const stageGroups = STAGE_ORDER.map((stage) => ({
    stage,
    items: matches
      .filter((m) => m.stage === stage && predByMatch.has(m.id))
      .sort((a, b) => {
        const da = a.match_date ?? "";
        const db = b.match_date ?? "";
        if (da !== db) return da < db ? -1 : 1;
        return a.id - b.id;
      }),
  })).filter((g) => g.items.length > 0);

  if (stageGroups.length === 0) return null;

  return (
    <div className="border-t border-stone-100 pt-2.5">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
        Punktid mängude kaupa
      </p>
      <div className="space-y-1.5">
        {stageGroups.map(({ stage, items }) => {
          const isOpen = openStages.has(stage);
          const stagePts = items.reduce((sum, m) => {
            const pred = predByMatch.get(m.id)!;
            return sum + calcMatchPoints(pred, m);
          }, 0);
          return (
            <div
              key={stage}
              className="overflow-hidden rounded-sm border border-stone-200"
            >
              <button
                type="button"
                onClick={() => toggle(stage)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-2 bg-stone-50/60 px-2.5 py-2 text-left transition-colors hover:bg-stone-100/70"
              >
                <span className="text-xs font-semibold text-navy">
                  {STAGE_LABEL[stage]}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-stone-500">
                    {stagePts} p
                  </span>
                  <span
                    className={`text-stone-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </span>
              </button>
              {isOpen && (
                <div className="divide-y divide-stone-100">
                  {items.map((m) => {
                    const pred = predByMatch.get(m.id)!;
                    const auto = calcMatchPoints(
                      { ...pred, points_override: null },
                      m
                    );
                    const hasResult =
                      m.actual_home_score !== null &&
                      m.actual_away_score !== null;
                    const overridden =
                      pred.points_override !== null &&
                      pred.points_override !== undefined;
                    return (
                      <form
                        key={`${m.id}-${pred.points_override ?? "auto"}`}
                        action={savePointsOverride}
                        className="flex items-center gap-2 px-2.5 py-1.5"
                      >
                        <input type="hidden" name="participant_id" value={participantId} />
                        <input type="hidden" name="match_id" value={m.id} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-medium text-navy">
                            {m.home_team} – {m.away_team}
                          </div>
                          <div className="text-[10px] text-stone-400">
                            Ennustus {pred.predicted_home_score}:{pred.predicted_away_score}
                            {" · "}
                            Tulemus{" "}
                            {hasResult
                              ? `${m.actual_home_score}:${m.actual_away_score}`
                              : "–"}
                            {" · "}Auto {auto} p
                            {overridden && (
                              <span className="font-semibold text-gold">
                                {" "}
                                · Muudetud
                              </span>
                            )}
                          </div>
                        </div>
                        <input
                          type="number"
                          name="points_override"
                          step={1}
                          defaultValue={pred.points_override ?? ""}
                          placeholder={String(auto)}
                          title="Tühi = automaatne"
                          className={`w-14 px-1 py-1 text-center text-xs font-semibold ${INPUT}`}
                        />
                        <SubmitButton variant="outline" className="px-2.5 py-1 text-[11px]">
                          OK
                        </SubmitButton>
                      </form>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-1 text-[10px] text-stone-400">
        Tühi väli = punktid arvutatakse automaatselt. Sisesta number, et punktid
        käsitsi üle kirjutada (võib olla 0).
      </p>
    </div>
  );
}
