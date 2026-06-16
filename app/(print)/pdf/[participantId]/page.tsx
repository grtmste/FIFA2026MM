import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthenticated } from "@/lib/auth";
import { Match, Participant, Prediction } from "@/lib/types";
import { formatMatchDate, formatMatchTime } from "@/lib/format";
import { groupColor } from "@/lib/groupColors";
import PrintTrigger from "./PrintTrigger";

export const revalidate = 0;

/* Derive unique teams per group from match data */
function buildGroups(matches: Match[]): Record<string, string[]> {
  const groups: Record<string, Set<string>> = {};
  for (const m of matches) {
    if (!m.group_name) continue;
    if (!groups[m.group_name]) groups[m.group_name] = new Set();
    groups[m.group_name].add(m.home_team);
    groups[m.group_name].add(m.away_team);
  }
  return Object.fromEntries(
    Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [k, Array.from(v).sort()])
  );
}

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
  const groups = buildGroups(allMatches);
  const groupKeys = Object.keys(groups); // A–L sorted

  // 3 columns on page 1: divide 72 matches into thirds
  const third = Math.ceil(allMatches.length / 3);
  const col1 = allMatches.slice(0, third);
  const col2 = allMatches.slice(third, third * 2);
  const col3 = allMatches.slice(third * 2);

  return (
    <>
      <PrintTrigger />
      <style>{`
        @page { size: A4 portrait; margin: 7mm 6mm; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { margin: 0; font-family: system-ui, -apple-system, sans-serif; font-size: 8.5pt; color: #1b2447; background: white; }
        .page { page-break-after: always; }
        .page:last-child { page-break-after: auto; }

        /* Header */
        .page-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1b2447; padding-bottom: 3pt; margin-bottom: 4pt; }
        .logo { height: 26pt; width: auto; }
        .participant-name { font-size: 12pt; font-weight: 800; color: #1b2447; line-height: 1; }
        .sheet-label { font-size: 6.5pt; letter-spacing: 0.1em; text-transform: uppercase; color: #9ca3af; }

        /* 3-column match grid */
        .match-cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2pt; }
        .match-col { display: flex; flex-direction: column; gap: 1.5pt; }

        /* Match row */
        .match-row { display: flex; align-items: center; gap: 2pt; padding: 1.5pt 2.5pt; border: 0.5pt solid #e5e7eb; border-radius: 2pt; }
        .group-badge { width: 11pt; height: 11pt; flex-shrink: 0; border-radius: 1.5pt; display: flex; align-items: center; justify-content: center; font-size: 6.5pt; font-weight: 800; color: rgba(27,36,71,0.85); }
        .match-info { flex: 1; min-width: 0; }
        .match-teams { font-size: 7.5pt; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.25; }
        .match-date { font-size: 6pt; color: #9ca3af; line-height: 1; }
        .scores { display: flex; align-items: center; gap: 1.5pt; flex-shrink: 0; }
        .score-box { width: 13pt; height: 13pt; border: 0.5pt solid; border-radius: 1.5pt; display: flex; align-items: center; justify-content: center; font-size: 7.5pt; font-weight: 700; }
        .score-box.filled { border-color: #1b2447; background: #1b2447; color: white; }
        .score-box.empty { border-color: #d1d5db; background: white; color: transparent; }
        .score-sep { font-size: 6.5pt; font-weight: 700; color: #d1d5db; }

        /* Group summary table */
        .section-label { font-size: 6.5pt; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #9ca3af; margin: 5pt 0 3pt; }
        .groups-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2pt; }
        .group-card { border: 0.5pt solid #e5e7eb; border-radius: 2pt; overflow: hidden; }
        .group-header { padding: 2pt 4pt; font-size: 8pt; font-weight: 800; color: rgba(27,36,71,0.85); }
        .group-team { padding: 1.5pt 4pt; font-size: 7pt; color: #374151; border-top: 0.5pt solid #f3f4f6; background: white; }

        /* Bonus */
        .bonus-row { display: flex; gap: 3pt; padding: 2pt 0; border-bottom: 0.5pt solid #f3f4f6; }
        .bonus-num { font-size: 7pt; font-weight: 700; color: #9ca3af; flex-shrink: 0; }
        .bonus-q { font-size: 7.5pt; font-weight: 600; color: #1b2447; }
        .bonus-a { font-size: 7.5pt; color: #6b7280; }

        /* Participants */
        .participants-row { display: flex; flex-wrap: wrap; gap: 2.5pt; margin-top: 3pt; }
        .chip { padding: 1pt 5pt; border-radius: 2pt; font-size: 7pt; font-weight: 600; }
        .chip.self { background: #1b2447; color: white; }
        .chip.other { background: #f1f5f9; color: #475569; }
        .divider { border: none; border-top: 0.5pt solid #e5e7eb; margin: 4pt 0; }
      `}</style>

      {/* ──── PAGE 1 : all match predictions in 3 columns ──── */}
      <div className="page">
        <div className="page-header">
          <img src="/Football-header.svg" alt="Jalka MM" className="logo" />
          <div style={{ textAlign: "right" }}>
            <div className="sheet-label">Ennustusleht</div>
            <div className="participant-name">{participant.name}</div>
          </div>
        </div>

        <div className="match-cols">
          <div className="match-col">
            {col1.map((m) => <MatchRow key={m.id} match={m} pred={predMap.get(m.id)} />)}
          </div>
          <div className="match-col">
            {col2.map((m) => <MatchRow key={m.id} match={m} pred={predMap.get(m.id)} />)}
          </div>
          <div className="match-col">
            {col3.map((m) => <MatchRow key={m.id} match={m} pred={predMap.get(m.id)} />)}
          </div>
        </div>
      </div>

      {/* ──── PAGE 2 : group summary + bonus + participants ──── */}
      <div className="page">
        <div className="page-header">
          <img src="/Football-header.svg" alt="Jalka MM" className="logo" />
          <div style={{ textAlign: "right" }}>
            <div className="sheet-label">Ennustusmäng 2026 · leht 2</div>
            <div className="participant-name">{participant.name}</div>
          </div>
        </div>

        {/* Group summary */}
        <div className="section-label">Alagruppide koosseis</div>
        <div className="groups-grid">
          {groupKeys.map((g) => {
            const bg = groupColor(g);
            return (
              <div key={g} className="group-card">
                <div className="group-header" style={{ backgroundColor: bg }}>
                  Grupp {g}
                </div>
                {groups[g].map((team) => (
                  <div key={team} className="group-team">{team}</div>
                ))}
              </div>
            );
          })}
        </div>

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
                  <div>
                    <span className="bonus-q">{q.question_text}</span>
                    <span style={{ fontSize: "6.5pt", color: "#9ca3af" }}> ({q.max_points}p)</span>
                    {ans?.answer_text && (
                      <span className="bonus-a"> — {ans.answer_text}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Participants pool */}
        {participants.length > 0 && (
          <>
            <hr className="divider" />
            <div className="section-label">Osalejad</div>
            <div className="participants-row">
              {participants.map((p) => (
                <span key={p.id} className={`chip ${p.id === params.participantId ? "self" : "other"}`}>
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

function MatchRow({ match, pred }: { match: Match; pred?: Prediction }) {
  const bg = match.group_name ? groupColor(match.group_name) : "#9CACBE";
  return (
    <div className="match-row" style={{ borderLeft: `2.5pt solid ${bg}` }}>
      {match.group_name && (
        <span className="group-badge" style={{ backgroundColor: bg }}>
          {match.group_name}
        </span>
      )}
      <div className="match-info">
        <div className="match-teams">{match.home_team} – {match.away_team}</div>
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
