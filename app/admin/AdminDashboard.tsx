"use client";

import { useMemo, useState } from "react";
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
  deleteParticipant,
  saveBonusAnswer,
  saveBonusCorrectAnswer,
  saveMatchResult,
  savePrediction,
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
  "rounded-lg border border-slate-200 bg-white text-navy transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";

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

  const groupMatches = useMemo(
    () => matches.filter((m) => m.stage === "group"),
    [matches]
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 ${
              tab === t.id
                ? "bg-white text-navy shadow-sm"
                : "text-slate-500 hover:text-navy"
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
            groupMatches={groupMatches}
            predictions={predictions}
            selectedParticipantId={selectedParticipantId}
            onSelectParticipant={setSelectedParticipantId}
          />
        )}

        {tab === "results" && <ResultsTab groupMatches={groupMatches} />}

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
        className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-card"
      >
        <input
          type="text"
          name="name"
          placeholder="Uue osaleja nimi"
          required
          className={`flex-1 px-3 py-2 text-sm placeholder-slate-400 ${INPUT}`}
        />
        <SubmitButton variant="primary" className="px-4 py-2 text-sm" successLabel="Lisatud">
          + Lisa
        </SubmitButton>
      </form>

      <div className="space-y-2">
        {participants.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-card transition-shadow hover:shadow-card-hover"
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
          <p className="text-sm text-slate-400">Osalejaid ei ole veel lisatud.</p>
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
    return <p className="text-sm text-slate-400">Osalejaid ei ole veel lisatud.</p>;
  }

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
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
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white"
          style={{ backgroundColor: groupColor(match.group_name) }}
        >
          {match.group_name}
        </span>
      )}
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-semibold text-navy">
          {match.home_team} – {match.away_team}
        </span>
        <span className="text-[10px] text-slate-400">
          {formatMatchDate(match.match_date)} · {formatMatchTime(match.match_date)}
        </span>
      </div>
    </div>
  );
}

function PredictionsTab({
  participants,
  groupMatches,
  predictions,
  selectedParticipantId,
  onSelectParticipant,
}: {
  participants: Participant[];
  groupMatches: Match[];
  predictions: Prediction[];
  selectedParticipantId: string;
  onSelectParticipant: (id: string) => void;
}) {
  const predictionByMatch = useMemo(() => {
    const map = new Map<number, Prediction>();
    predictions
      .filter((p) => p.participant_id === selectedParticipantId)
      .forEach((p) => map.set(p.match_id, p));
    return map;
  }, [predictions, selectedParticipantId]);

  return (
    <div className="space-y-3">
      <ParticipantSelect
        participants={participants}
        selectedParticipantId={selectedParticipantId}
        onSelectParticipant={onSelectParticipant}
      />

      {selectedParticipantId && (
        <div className="space-y-2">
          {groupMatches.map((match) => {
            const existing = predictionByMatch.get(match.id);
            return (
              <form
                key={`${selectedParticipantId}-${match.id}`}
                action={savePrediction}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <input type="hidden" name="participant_id" value={selectedParticipantId} />
                <input type="hidden" name="match_id" value={match.id} />
                <MatchLabel match={match} />
                <input
                  type="number"
                  name="predicted_home_score"
                  min={0}
                  defaultValue={existing?.predicted_home_score ?? ""}
                  className={SCORE_INPUT}
                />
                <span className="text-xs font-bold text-slate-300">:</span>
                <input
                  type="number"
                  name="predicted_away_score"
                  min={0}
                  defaultValue={existing?.predicted_away_score ?? ""}
                  className={SCORE_INPUT}
                />
                <SubmitButton variant="outline" className="px-3 py-1.5 text-xs">
                  OK
                </SubmitButton>
              </form>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ResultsTab({ groupMatches }: { groupMatches: Match[] }) {
  return (
    <div className="space-y-2">
      {groupMatches.map((match) => (
        <form
          key={match.id}
          action={saveMatchResult}
          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-card transition-shadow hover:shadow-card-hover"
        >
          <input type="hidden" name="match_id" value={match.id} />
          <MatchLabel match={match} />
          <input
            type="number"
            name="actual_home_score"
            min={0}
            defaultValue={match.actual_home_score ?? ""}
            className={SCORE_INPUT}
          />
          <span className="text-xs font-bold text-slate-300">:</span>
          <input
            type="number"
            name="actual_away_score"
            min={0}
            defaultValue={match.actual_away_score ?? ""}
            className={SCORE_INPUT}
          />
          <SubmitButton variant="outline" className="px-3 py-1.5 text-xs">
            OK
          </SubmitButton>
        </form>
      ))}
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
      <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
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
            <span className="flex-1 text-xs text-slate-600">
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
                className="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <input type="hidden" name="participant_id" value={selectedParticipantId} />
                <input type="hidden" name="question_id" value={q.id} />
                <p className="text-xs font-semibold text-navy">
                  {idx + 1}. {q.question_text}{" "}
                  <span className="font-normal text-slate-400">({q.max_points} p)</span>
                </p>
                <input
                  type="text"
                  name="answer_text"
                  defaultValue={existing?.answer_text ?? ""}
                  placeholder="Osaleja vastus"
                  className={`w-full px-2.5 py-2 text-sm ${INPUT}`}
                />
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-500">Punktid:</label>
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
