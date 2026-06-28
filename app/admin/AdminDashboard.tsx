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
  const [selectedParticipantId, setSelectedParticipantId] = useState(
    participants[0]?.id ?? ""
  );

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
          <ParticipantsTab participants={participants} />
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

function ParticipantsTab({ participants }: { participants: Participant[] }) {
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

      <div className="space-y-2">
        {participants.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-2 rounded-sm border border-stone-200 bg-white p-2 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <form action={updateParticipant} className="flex flex-1 gap-2">
              <input type="hidden" name="id" value={p.id} />
              <input
                type="text"
                name="name"
                defaultValue={p.name}
                className={`flex-1 px-3 py-2 text-sm ${INPUT}`}
              />
              <SubmitButton variant="outline" className="px-3 py-2 text-xs">
                Salvesta
              </SubmitButton>
            </form>
            <form action={deleteParticipant}>
              <input type="hidden" name="id" value={p.id} />
              <SubmitButton variant="danger" className="px-3 py-2 text-xs">
                Kustuta
              </SubmitButton>
            </form>
          </div>
        ))}

        {participants.length === 0 && (
          <p className="text-sm text-stone-400">Osalejaid ei ole veel lisatud.</p>
        )}
      </div>
    </div>
  );
}

function ParticipantSelect({
  participants,
  selectedParticipantId,
  onSelectParticipant,
}: {
  participants: Participant[];
  selectedParticipantId: string;
  onSelectParticipant: (id: string) => void;
}) {
  if (participants.length === 0) {
    return <p className="text-sm text-stone-400">Osalejaid ei ole veel lisatud.</p>;
  }

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
        Vali osaleja
      </span>
      <select
        value={selectedParticipantId}
        onChange={(e) => onSelectParticipant(e.target.value)}
        className={`w-full px-3 py-2.5 text-sm font-medium ${INPUT}`}
      >
        {participants.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </label>
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
  return (
    <div className="space-y-5">
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
        return (
          <div key={stage} className="space-y-2">
            <h3 className="text-sm font-bold text-navy">{STAGE_LABEL[stage]}</h3>
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
              </form>
            ))}
          </div>
        );
      })}
    </div>
  );
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
  const answerByQuestion = useMemo(() => {
    const map = new Map<number, BonusAnswer>();
    bonusAnswers
      .filter((a) => a.participant_id === selectedParticipantId)
      .forEach((a) => map.set(a.question_id, a));
    return map;
  }, [bonusAnswers, selectedParticipantId]);

  return (
    <div className="space-y-4">
      <div className="space-y-2.5 rounded-sm border border-stone-200 bg-white p-4 shadow-card">
        <h4 className="flex items-center gap-1.5 text-sm font-bold text-navy">
          ⭐ Õiged vastused
        </h4>
        {bonusQuestions.map((q, idx) => (
          <form
            key={q.id}
            action={saveBonusCorrectAnswer}
            className="flex items-center gap-2"
          >
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

      <ParticipantSelect
        participants={participants}
        selectedParticipantId={selectedParticipantId}
        onSelectParticipant={onSelectParticipant}
      />

      {selectedParticipantId && (
        <div className="space-y-2">
          {bonusQuestions.map((q, idx) => {
            const existing = answerByQuestion.get(q.id);
            return (
              <form
                key={`${selectedParticipantId}-${q.id}`}
                action={saveBonusAnswer}
                className="space-y-2.5 rounded-sm border border-stone-200 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover"
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
}
