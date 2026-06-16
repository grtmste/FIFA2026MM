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
    supabaseAdmin
      .from("participants")
      .select("*")
      .eq("id", params.participantId)
      .single(),
    supabaseAdmin
      .from("matches")
      .select("*")
      .eq("stage", "group")
      .order("match_date", { ascending: true, nullsFirst: false })
      .order("id", { ascending: true }),
    supabaseAdmin
      .from("predictions")
      .select("*")
      .eq("participant_id", params.participantId),
    supabaseAdmin
      .from("participants")
      .select("*")
      .order("name", { ascending: true }),
    supabaseAdmin.from("bonus_questions").select("*").order("id", { ascending: true }),
    supabaseAdmin
      .from("bonus_answers")
      .select("*")
      .eq("participant_id", params.participantId),
  ]);

  if (!participant) notFound();

  const typedMatches = (matches ?? []) as Match[];
  const typedPredictions = (predictions ?? []) as Prediction[];
  const typedParticipants = (allParticipants ?? []) as Participant[];
  const predMap = new Map<number, Prediction>();
  typedPredictions.forEach((p) => predMap.set(p.match_id, p));

  // Split matches into two pages (~24 per page for clean layout)
  const PAGE_SIZE = 24;
  const page1 = typedMatches.slice(0, PAGE_SIZE);
  const page2 = typedMatches.slice(PAGE_SIZE);

  const otherParticipants = typedParticipants.filter(
    (p) => p.id !== params.participantId
  );

  return (
    <>
      <PrintTrigger />
      <style>{`
        @page { size: A4; margin: 14mm 12mm; }
        @media print { .page-break { page-break-before: always; } }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      `}</style>

      {/* ───── PAGE 1 ───── */}
      <div className="px-2 py-4">
        <Header participantName={participant.name} />
        <MatchList matches={page1} predMap={predMap} />
      </div>

      {/* ───── PAGE 2 ───── */}
      {(page2.length > 0 || bonusQuestions?.length) && (
        <div className="page-break px-2 py-4">
          <Header participantName={participant.name} compact />
          {page2.length > 0 && <MatchList matches={page2} predMap={predMap} />}

          {/* Bonus questions */}
          {bonusQuestions && bonusQuestions.length > 0 && (
            <div className="mt-4">
              <SectionTitle>Boonusküsimused</SectionTitle>
              {bonusQuestions.map((q, i) => {
                const ans = bonusAnswers?.find((a) => a.question_id === q.id);
                return (
                  <div
                    key={q.id}
                    className="mb-2 flex items-start gap-2 border-b border-stone-100 pb-2"
                  >
                    <span className="mt-0.5 text-xs font-bold text-stone-400">
                      {i + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-navy">
                        {q.question_text}
                        <span className="ml-1 font-normal text-stone-400">
                          ({q.max_points} p)
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-stone-600">
                        {ans?.answer_text ?? "–"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Participants list */}
          {otherParticipants.length > 0 && (
            <div className="mt-6 border-t border-stone-200 pt-4">
              <SectionTitle>Osalejad</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {typedParticipants.map((p) => (
                  <span
                    key={p.id}
                    className={`rounded px-2 py-0.5 text-xs font-semibold ${
                      p.id === params.participantId
                        ? "bg-navy text-white"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* If only 1 page: show participants at the bottom */}
      {page2.length === 0 && !(bonusQuestions?.length) && otherParticipants.length > 0 && (
        <div className="px-2 pb-6">
          <div className="mt-6 border-t border-stone-200 pt-4">
            <SectionTitle>Osalejad</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {typedParticipants.map((p) => (
                <span
                  key={p.id}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    p.id === params.participantId
                      ? "bg-navy text-white"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Header({
  participantName,
  compact,
}: {
  participantName: string;
  compact?: boolean;
}) {
  return (
    <div className={`mb-4 flex items-center justify-between border-b-2 border-navy pb-3 ${compact ? "mb-3" : ""}`}>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Football-header.svg" alt="Jalka MM" className="h-12 w-auto" />
      </div>
      <div className="text-right">
        <p className="text-xs uppercase tracking-widest text-stone-400">
          Ennustusleht
        </p>
        <p className="text-lg font-extrabold text-navy">{participantName}</p>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
      {children}
    </h3>
  );
}

function MatchList({
  matches,
  predMap,
}: {
  matches: Match[];
  predMap: Map<number, Prediction>;
}) {
  return (
    <div className="space-y-1">
      {matches.map((match) => {
        const pred = predMap.get(match.id);
        const bg = match.group_name ? groupColor(match.group_name) : "#9CACBE";
        return (
          <div
            key={match.id}
            className="flex items-center gap-2 rounded border border-stone-100 bg-white px-2 py-1.5"
            style={{ borderLeft: `3px solid ${bg}` }}
          >
            {match.group_name && (
              <span
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[10px] font-bold text-navy/80"
                style={{ backgroundColor: bg }}
              >
                {match.group_name}
              </span>
            )}
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xs font-semibold text-navy">
                {match.home_team} – {match.away_team}
              </span>
              <span className="text-[9px] text-stone-400">
                {formatMatchDate(match.match_date)} · {formatMatchTime(match.match_date)}
              </span>
            </div>
            {/* Score boxes */}
            <div className="flex flex-shrink-0 items-center gap-1">
              <ScoreBox value={pred?.predicted_home_score} />
              <span className="text-[10px] font-bold text-stone-300">:</span>
              <ScoreBox value={pred?.predicted_away_score} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScoreBox({ value }: { value?: number }) {
  const hasValue = value !== undefined && value !== null;
  return (
    <span
      className={`flex h-6 w-6 items-center justify-center rounded border text-xs font-bold ${
        hasValue
          ? "border-navy bg-navy text-white"
          : "border-stone-200 bg-white text-transparent"
      }`}
    >
      {hasValue ? value : "0"}
    </span>
  );
}
