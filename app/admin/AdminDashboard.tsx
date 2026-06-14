"use client";

import { useMemo, useState } from "react";
import {
  BonusAnswer,
  BonusQuestion,
  Match,
  Participant,
  Prediction,
} from "@/lib/types";
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

const TABS: { id: Tab; label: string }[] = [
  { id: "participants", label: "Osalejad" },
  { id: "predictions", label: "Ennustused" },
  { id: "results", label: "Tulemused" },
  { id: "bonus", label: "Boonused" },
];

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
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-navy-light bg-navy-light/40 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-2 py-2 text-xs font-semibold whitespace-nowrap ${
              tab === t.id ? "bg-gold text-navy" : "text-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

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
  );
}

function ParticipantsTab({ participants }: { participants: Participant[] }) {
  return (
    <div className="space-y-3">
      <form
        action={addParticipant}
        className="flex gap-2 rounded-xl border border-navy-light bg-navy-light/40 p-3"
      >
        <input
          type="text"
          name="name"
          placeholder="Uue osaleja nimi"
          required
          className="flex-1 rounded-lg border border-navy-light bg-navy px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-gold px-3 py-2 text-sm font-bold text-navy"
        >
          Lisa
        </button>
      </form>

      <div className="space-y-2">
        {participants.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-2 rounded-xl border border-navy-light bg-navy-light/40 p-2"
          >
            <form action={updateParticipant} className="flex flex-1 gap-2">
              <input type="hidden" name="id" value={p.id} />
              <input
                type="text"
                name="name"
                defaultValue={p.name}
                className="flex-1 rounded-lg border border-navy-light bg-navy px-3 py-2 text-sm text-gray-100 focus:border-gold focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg border border-gold px-2 py-2 text-xs font-semibold text-gold"
              >
                Salvesta
              </button>
            </form>
            <form action={deleteParticipant}>
              <input type="hidden" name="id" value={p.id} />
              <button
                type="submit"
                className="rounded-lg border border-red-500/50 px-2 py-2 text-xs font-semibold text-red-400"
              >
                Kustuta
              </button>
            </form>
          </div>
        ))}

        {participants.length === 0 && (
          <p className="text-sm text-gray-400">Osalejaid ei ole veel lisatud.</p>
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
    return <p className="text-sm text-gray-400">Osalejaid ei ole veel lisatud.</p>;
  }

  return (
    <select
      value={selectedParticipantId}
      onChange={(e) => onSelectParticipant(e.target.value)}
      className="w-full rounded-lg border border-navy-light bg-navy-light/40 px-3 py-2 text-sm text-gray-100 focus:border-gold focus:outline-none"
    >
      {participants.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
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

  const groups = useMemo(
    () =>
      Array.from(
        new Set(groupMatches.map((m) => m.group_name).filter(Boolean))
      ).sort() as string[],
    [groupMatches]
  );

  return (
    <div className="space-y-3">
      <ParticipantSelect
        participants={participants}
        selectedParticipantId={selectedParticipantId}
        onSelectParticipant={onSelectParticipant}
      />

      {selectedParticipantId &&
        groups.map((groupName) => (
          <div key={groupName} className="space-y-2">
            <h4 className="text-sm font-bold text-gold">Grupp {groupName}</h4>
            {groupMatches
              .filter((m) => m.group_name === groupName)
              .map((match) => {
                const existing = predictionByMatch.get(match.id);
                return (
                  <form
                    key={match.id}
                    action={savePrediction}
                    className="flex items-center gap-2 rounded-xl border border-navy-light bg-navy-light/40 p-2"
                  >
                    <input type="hidden" name="participant_id" value={selectedParticipantId} />
                    <input type="hidden" name="match_id" value={match.id} />
                    <span className="flex-1 text-xs">
                      {match.home_team} - {match.away_team}
                    </span>
                    <input
                      type="number"
                      name="predicted_home_score"
                      min={0}
                      defaultValue={existing?.predicted_home_score ?? ""}
                      className="w-12 rounded-md border border-navy-light bg-navy px-1 py-1 text-center text-sm"
                    />
                    <span className="text-xs text-gray-500">:</span>
                    <input
                      type="number"
                      name="predicted_away_score"
                      min={0}
                      defaultValue={existing?.predicted_away_score ?? ""}
                      className="w-12 rounded-md border border-navy-light bg-navy px-1 py-1 text-center text-sm"
                    />
                    <button
                      type="submit"
                      className="rounded-md border border-gold px-2 py-1 text-xs font-semibold text-gold"
                    >
                      OK
                    </button>
                  </form>
                );
              })}
          </div>
        ))}
    </div>
  );
}

function ResultsTab({ groupMatches }: { groupMatches: Match[] }) {
  const groups = useMemo(
    () =>
      Array.from(
        new Set(groupMatches.map((m) => m.group_name).filter(Boolean))
      ).sort() as string[],
    [groupMatches]
  );

  return (
    <div className="space-y-3">
      {groups.map((groupName) => (
        <div key={groupName} className="space-y-2">
          <h4 className="text-sm font-bold text-gold">Grupp {groupName}</h4>
          {groupMatches
            .filter((m) => m.group_name === groupName)
            .map((match) => (
              <form
                key={match.id}
                action={saveMatchResult}
                className="flex items-center gap-2 rounded-xl border border-navy-light bg-navy-light/40 p-2"
              >
                <input type="hidden" name="match_id" value={match.id} />
                <span className="flex-1 text-xs">
                  {match.home_team} - {match.away_team}
                </span>
                <input
                  type="number"
                  name="actual_home_score"
                  min={0}
                  defaultValue={match.actual_home_score ?? ""}
                  className="w-12 rounded-md border border-navy-light bg-navy px-1 py-1 text-center text-sm"
                />
                <span className="text-xs text-gray-500">:</span>
                <input
                  type="number"
                  name="actual_away_score"
                  min={0}
                  defaultValue={match.actual_away_score ?? ""}
                  className="w-12 rounded-md border border-navy-light bg-navy px-1 py-1 text-center text-sm"
                />
                <button
                  type="submit"
                  className="rounded-md border border-gold px-2 py-1 text-xs font-semibold text-gold"
                >
                  OK
                </button>
              </form>
            ))}
        </div>
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
      <div className="space-y-2 rounded-xl border border-navy-light bg-navy-light/40 p-3">
        <h4 className="text-sm font-bold text-gold">Õiged vastused</h4>
        {bonusQuestions.map((q, idx) => (
          <form
            key={q.id}
            action={saveBonusCorrectAnswer}
            className="flex items-center gap-2"
          >
            <input type="hidden" name="question_id" value={q.id} />
            <span className="flex-1 text-xs">
              {idx + 1}. {q.question_text}
            </span>
            <input
              type="text"
              name="correct_answer"
              defaultValue={q.correct_answer ?? ""}
              placeholder="Õige vastus"
              className="w-28 rounded-md border border-navy-light bg-navy px-2 py-1 text-xs"
            />
            <button
              type="submit"
              className="rounded-md border border-gold px-2 py-1 text-xs font-semibold text-gold"
            >
              OK
            </button>
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
                key={q.id}
                action={saveBonusAnswer}
                className="space-y-2 rounded-xl border border-navy-light bg-navy-light/40 p-3"
              >
                <input type="hidden" name="participant_id" value={selectedParticipantId} />
                <input type="hidden" name="question_id" value={q.id} />
                <p className="text-xs font-semibold">
                  {idx + 1}. {q.question_text} ({q.max_points} p)
                </p>
                <input
                  type="text"
                  name="answer_text"
                  defaultValue={existing?.answer_text ?? ""}
                  placeholder="Osaleja vastus"
                  className="w-full rounded-md border border-navy-light bg-navy px-2 py-1 text-sm"
                />
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400">Punktid:</label>
                  <input
                    type="number"
                    name="points_awarded"
                    min={0}
                    max={q.max_points}
                    defaultValue={existing?.points_awarded ?? ""}
                    className="w-20 rounded-md border border-navy-light bg-navy px-2 py-1 text-center text-sm"
                  />
                  <button
                    type="submit"
                    className="ml-auto rounded-md border border-gold px-3 py-1 text-xs font-semibold text-gold"
                  >
                    Salvesta
                  </button>
                </div>
              </form>
            );
          })}
        </div>
      )}
    </div>
  );
}
