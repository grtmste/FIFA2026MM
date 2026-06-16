import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthenticated } from "@/lib/auth";
import { Match, Participant, Prediction } from "@/lib/types";
import { formatMatchDate, formatMatchTime } from "@/lib/format";
import { groupColor } from "@/lib/groupColors";
import PrintTrigger from "./PrintTrigger";

export const revalidate = 0;

export default async function PdfPage({
  params,
}: {
  params: { participantId: string };
}) {
  if (!isAdminAuthenticated()) notFound();

  const [
    { data: participant },
    { data: matches },
    { data: predictions },
    { data: allParticipants },
    { data: bonusQuestions },
    { data: bonusAnswers },
  ] = await Promise.all([
    supabaseAdmin.from("participants").select("*").eq("id", params.participantId).single(),
    supabaseAdmin
      .from("matches")
      .select("*")
      .eq("stage", "group")
      .order("match_date", { ascending: true, nullsFirst: false })
      .order("id", { ascending: true }),
    supabaseAdmin.from("predictions").select("*").eq("participant_id", params.participantId),
    supabaseAdmin.from("participants").select("*").order("name", { ascending: true }),
    supabaseAdmin.from("bonus_questions").select("*").order("id", { ascending: true }),
    supabaseAdmin.from("bonus_answers").select("*").eq("participant_id", params.participantId),
  ]);

  if (!participant) notFound();

  const allMatches = (matches ?? []) as Match[];
  const preds = (predictions ?? []) as Prediction[];
  const participants = (allParticipants ?? []) as Participant[];
  const predMap = new Map<number, Prediction>(preds.map((p) => [p.match_id, p]));

  // Split 72 matches evenly across 2 pages (36 each)
  const half = Math.ceil(allMatches.length / 2);
  const page1Matches = allMatches.slice(0, half);
  const page2Matches = allMatches.slice(half);

  return (
    <>
      <PrintTrigger />
      <style>{`
        @page {
          size: A4 portrait;
          margin: 8mm 7mm;
        }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { margin: 0; font-family: system-ui, sans-serif; font-size: 9pt; color: #1b2447; background: white; }
        .page { page-break-after: always; padding: 0; }
        .page:last-child { page-break-after: auto; }
        .page-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1b2447; padding-bottom: 4pt; margin-bottom: 5pt; }
        .logo { height: 28pt; width: auto; }
        .participant-name { font-size: 13pt; font-weight: 800; color: #1b2447; }
        .sheet-label { font-size: 7pt; letter-spacing: 0.1em; text-transform: uppercase; color: #999; }
        .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 3pt; }
        .match-row { display: flex; align-items: center; gap: 3pt; padding: 2pt 3pt; border: 0.5pt solid #e5e7eb; border-radius: 2pt; background: white; }
        .group-badge { width: 12pt; height: 12pt; flex-shrink: 0; border-radius: 2pt; display: flex; align-items: center; justify-content: center; font-size: 7pt; font-weight: 700; color: rgba(27,36,71,0.8); }
        .match-info { flex: 1; min-width: 0; }
        .match-teams { font-size: 8pt; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2; }
        .match-date { font-size: 6.5pt; color: #9ca3af; line-height: 1; }
        .scores { display: flex; align-items: center; gap: 2pt; flex-shrink: 0; }
        .score-box { width: 14pt; height: 14pt; border: 0.5pt solid; border-radius: 2pt; display: flex; align-items: center; justify-content: center; font-size: 8pt; font-weight: 700; }
        .score-box.filled { border-color: #1b2447; background: #1b2447; color: white; }
        .score-box.empty { border-color: #d1d5db; background: white; color: transparent; }
        .score-sep { font-size: 7pt; font-weight: 700; color: #d1d5db; }
        .section-label { font-size: 6.5pt; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #9ca3af; margin: 6pt 0 3pt; }
        .bonus-row { display: flex; gap: 4pt; padding: 2pt 0; border-bottom: 0.5pt solid #f3f4f6; align-items: flex-start; }
        .bonus-num { font-size: 7pt; font-weight: 700; color: #9ca3af; flex-shrink: 0; margin-top: 0.5pt; }
        .bonus-q { font-size: 8pt; font-weight: 600; flex: 1; }
        .bonus-a { font-size: 8pt; color: #6b7280; }
        .participants-row { display: flex; flex-wrap: wrap; gap: 3pt; margin-top: 4pt; }
        .participant-chip { padding: 1pt 5pt; border-radius: 2pt; font-size: 7.5pt; font-weight: 600; }
        .participant-chip.self { background: #1b2447; color: white; }
        .participant-chip.other { background: #f1f5f9; color: #475569; }
        .divider { border: none; border-top: 0.5pt solid #e5e7eb; margin: 5pt 0 4pt; }
      `}</style>

      {/* ── PAGE 1 ── */}
      <div className="page">
        <div className="page-header">
          <img src="/Football-header.svg" alt="Jalka MM" className="logo" />
          <div style={{ textAlign: "right" }}>
            <div className="sheet-label">Ennustusleht</div>
            <div className="participant-name">{participant.name}</div>
          </div>
        </div>
        <MatchGrid matches={page1Matches} predMap={predMap} />
      </div>

      {/* ── PAGE 2 ── */}
      <div className="page">
        <div className="page-header">
          <img src="/Football-header.svg" alt="Jalka MM" className="logo" />
          <div style={{ textAlign: "right" }}>
            <div className="sheet-label">Ennustusleht · leht 2</div>
            <div className="participant-name">{participant.name}</div>
          </div>
        </div>
        <MatchGrid matches={page2Matches} predMap={predMap} />

        {/* Bonus questions */}
        {bonusQuestions && bonusQuestions.length > 0 && (
          <>
            <hr className="divider" />
            <div className="section-label">Boonusküsimused</div>
            {bonusQuestions.map((q, i) => {
              const ans = bonusAnswers?.find((a) => a.question_id === q.id);
              return (
                <div key={q.id} className="bonus-row">
                  <span className="bonus-num">{i + 1}.</span>
                  <div style={{ flex: 1 }}>
                    <span className="bonus-q">{q.question_text}</span>
                    <span style={{ fontSize: "7pt", color: "#9ca3af" }}> ({q.max_points}p)</span>
                    {ans?.answer_text && (
                      <span className="bonus-a"> — {ans.answer_text}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Participants */}
        {participants.length > 0 && (
          <>
            <hr className="divider" />
            <div className="section-label">Osalejad</div>
            <div className="participants-row">
              {participants.map((p) => (
                <span
                  key={p.id}
                  className={`participant-chip ${p.id === params.participantId ? "self" : "other"}`}
                >
                  {p.name}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function MatchGrid({
  matches,
  predMap,
}: {
  matches: Match[];
  predMap: Map<number, Prediction>;
}) {
  // Split into 2 columns
  const half = Math.ceil(matches.length / 2);
  const col1 = matches.slice(0, half);
  const col2 = matches.slice(half);

  return (
    <div className="cols">
      <div>
        {col1.map((m) => <MatchRow key={m.id} match={m} pred={predMap.get(m.id)} />)}
      </div>
      <div>
        {col2.map((m) => <MatchRow key={m.id} match={m} pred={predMap.get(m.id)} />)}
      </div>
    </div>
  );
}

function MatchRow({ match, pred }: { match: Match; pred?: Prediction }) {
  const bg = match.group_name ? groupColor(match.group_name) : "#9CACBE";
  return (
    <div
      className="match-row"
      style={{ borderLeft: `2.5pt solid ${bg}`, marginBottom: "2pt" }}
    >
      {match.group_name && (
        <span className="group-badge" style={{ backgroundColor: bg }}>
          {match.group_name}
        </span>
      )}
      <div className="match-info">
        <div className="match-teams">
          {match.home_team} – {match.away_team}
        </div>
        <div className="match-date">
          {formatMatchDate(match.match_date)} · {formatMatchTime(match.match_date)}
        </div>
      </div>
      <div className="scores">
        <ScoreBox value={pred?.predicted_home_score} />
        <span className="score-sep">:</span>
        <ScoreBox value={pred?.predicted_away_score} />
      </div>
    </div>
  );
}

function ScoreBox({ value }: { value?: number | null }) {
  const has = value !== undefined && value !== null;
  return (
    <span className={`score-box ${has ? "filled" : "empty"}`}>
      {has ? value : "0"}
    </span>
  );
}
