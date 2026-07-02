"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  adminCookieValue,
  COOKIE_NAME,
  getAdminPassword,
  isAdminAuthenticated,
} from "@/lib/auth";
import { resolveBracketTeams } from "@/lib/bracket";
import { extractPredictionScores } from "@/lib/pdfImport";
import { Match } from "@/lib/types";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/matches");
  revalidatePath("/boonused");
  revalidatePath("/admin");
}

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (password !== getAdminPassword()) {
    redirect("/admin?error=1");
  }

  cookies().set(COOKIE_NAME, adminCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/admin");
}

export async function logoutAction() {
  cookies().delete(COOKIE_NAME);
  redirect("/admin");
}

function requireAuth() {
  if (!isAdminAuthenticated()) {
    throw new Error("Unauthorized");
  }
}

export async function addParticipant(formData: FormData) {
  requireAuth();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await supabaseAdmin.from("participants").insert({ name });
  revalidateAll();
}

export async function updateParticipant(formData: FormData) {
  requireAuth();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;

  const history = String(formData.get("history") ?? "").trim();
  const isChampion = formData.get("is_champion") === "on";

  await supabaseAdmin
    .from("participants")
    .update({ name, history: history || null, is_champion: isChampion })
    .eq("id", id);
  revalidateAll();
}

export async function deleteParticipant(formData: FormData) {
  requireAuth();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabaseAdmin.from("participants").delete().eq("id", id);
  revalidateAll();
}

export async function savePrediction(formData: FormData) {
  requireAuth();
  const participantId = String(formData.get("participant_id") ?? "");
  const matchId = Number(formData.get("match_id"));
  const homeRaw = formData.get("predicted_home_score");
  const awayRaw = formData.get("predicted_away_score");

  if (!participantId || !matchId) return;

  if (homeRaw === "" || awayRaw === "" || homeRaw === null || awayRaw === null) {
    await supabaseAdmin
      .from("predictions")
      .delete()
      .eq("participant_id", participantId)
      .eq("match_id", matchId);
    revalidateAll();
    return;
  }

  const predictedHome = Number(homeRaw);
  const predictedAway = Number(awayRaw);

  await supabaseAdmin.from("predictions").upsert(
    {
      participant_id: participantId,
      match_id: matchId,
      predicted_home_score: predictedHome,
      predicted_away_score: predictedAway,
    },
    { onConflict: "participant_id,match_id" }
  );

  revalidateAll();
}

export type SaveAllResult =
  | { ok: true; saved: number; cleared: number }
  | { ok: false; error: string };

export async function saveAllPredictions(
  formData: FormData
): Promise<SaveAllResult> {
  requireAuth();
  const participantId = String(formData.get("participant_id") ?? "");
  const scoresRaw = String(formData.get("scores") ?? "");
  const clearEmpty = String(formData.get("clear_empty") ?? "") === "1";
  if (!participantId || !scoresRaw) {
    return { ok: false, error: "Puuduvad andmed." };
  }

  let scores: Array<{ match_id: number; home: string; away: string }>;
  try {
    scores = JSON.parse(scoresRaw);
  } catch {
    return { ok: false, error: "Skooride vorming on vigane." };
  }

  const toSave = scores
    .filter(
      (s) =>
        s.home !== "" &&
        s.away !== "" &&
        s.home != null &&
        s.away != null &&
        !Number.isNaN(Number(s.home)) &&
        !Number.isNaN(Number(s.away))
    )
    .map((s) => ({
      participant_id: participantId,
      match_id: s.match_id,
      predicted_home_score: Number(s.home),
      predicted_away_score: Number(s.away),
    }));

  // Determine which rows already exist so we can INSERT new ones and UPDATE
  // existing ones explicitly. This avoids depending on the
  // (participant_id, match_id) unique constraint that .upsert() needs — if
  // that constraint is missing from the database, upsert silently fails.
  const { data: existingRows, error: fetchErr } = await supabaseAdmin
    .from("predictions")
    .select("match_id")
    .eq("participant_id", participantId);
  if (fetchErr) {
    return { ok: false, error: `Andmete lugemine ebaõnnestus: ${fetchErr.message}` };
  }
  const existingIds = new Set(
    (existingRows ?? []).map((r) => (r as { match_id: number }).match_id)
  );

  const toInsert = toSave.filter((r) => !existingIds.has(r.match_id));
  const toUpdate = toSave.filter((r) => existingIds.has(r.match_id));

  if (toInsert.length > 0) {
    const { error } = await supabaseAdmin.from("predictions").insert(toInsert);
    if (error) {
      return { ok: false, error: `Lisamine ebaõnnestus: ${error.message}` };
    }
  }

  for (const r of toUpdate) {
    const { error } = await supabaseAdmin
      .from("predictions")
      .update({
        predicted_home_score: r.predicted_home_score,
        predicted_away_score: r.predicted_away_score,
      })
      .eq("participant_id", participantId)
      .eq("match_id", r.match_id);
    if (error) {
      return {
        ok: false,
        error: `Uuendamine ebaõnnestus (mäng ${r.match_id}): ${error.message}`,
      };
    }
  }

  // Only clear scores when the caller explicitly asks for it. Bulk save never
  // deletes by default, so an accidental save on a not-yet-loaded form can not
  // wipe predictions.
  let cleared = 0;
  if (clearEmpty) {
    const toDelete = scores
      .filter((s) => s.home === "" || s.away === "")
      .map((s) => s.match_id);
    if (toDelete.length > 0) {
      const { error } = await supabaseAdmin
        .from("predictions")
        .delete()
        .eq("participant_id", participantId)
        .in("match_id", toDelete);
      if (error) {
        return { ok: false, error: `Tühjendamine ebaõnnestus: ${error.message}` };
      }
      cleared = toDelete.length;
    }
  }

  // Verify the real saved count so the success message reflects the database,
  // not just what we attempted to write. Scope it to the match ids that were
  // submitted, so the count reflects this stage rather than every prediction
  // the participant has across all rounds.
  const submittedIds = scores.map((s) => s.match_id);
  const { count } = await supabaseAdmin
    .from("predictions")
    .select("*", { count: "exact", head: true })
    .eq("participant_id", participantId)
    .in("match_id", submittedIds);

  revalidateAll();
  return { ok: true, saved: count ?? toSave.length, cleared };
}

export type ImportResult =
  | {
      ok: true;
      scores: Array<{ match_id: number; home: number; away: number }>;
    }
  | { ok: false; error: string };

export async function importPredictionPdf(
  formData: FormData
): Promise<ImportResult> {
  requireAuth();
  try {
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return { ok: false, error: "Faili ei leitud." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const scores = await extractPredictionScores(buffer);

    if (scores.length === 0) {
      return {
        ok: false,
        error:
          "PDF-ist ei leitud ühtegi skoori. Veendu, et tegemist on täidetud ennustuslehega.",
      };
    }

    // The PDF's "#" column (and its skoor_N form fields) corresponds directly
    // to the match id, not to a date-sorted position. Map by id so the order
    // the app happens to display matches in is irrelevant. Every stage's sheet
    // uses the same field naming, so we validate against all match ids.
    const { data } = await supabaseAdmin.from("matches").select("id");
    const validIds = new Set((data ?? []).map((m) => (m as { id: number }).id));

    const mapped = scores
      .filter((s) => validIds.has(s.position))
      .map((s) => ({ match_id: s.position, home: s.home, away: s.away }));

    if (mapped.length === 0) {
      return {
        ok: false,
        error: "Ühtegi skoori ei õnnestunud mängudega siduda.",
      };
    }

    return { ok: true, scores: mapped };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "PDF-i lugemine ebaõnnestus.",
    };
  }
}

export async function saveMatchResult(formData: FormData) {
  requireAuth();
  const matchId = Number(formData.get("match_id"));
  const homeRaw = formData.get("actual_home_score");
  const awayRaw = formData.get("actual_away_score");

  if (!matchId) return;

  const actualHome =
    homeRaw === "" || homeRaw === null ? null : Number(homeRaw);
  const actualAway =
    awayRaw === "" || awayRaw === null ? null : Number(awayRaw);

  // "decision" encodes how a level knockout game was settled:
  // "" (normal time) | "et_home" | "et_away" | "pen_home" | "pen_away".
  const decision = String(formData.get("decision") ?? "");
  const penaltyWinner =
    decision === "pen_home" ? "home" : decision === "pen_away" ? "away" : null;
  const extraTimeWinner =
    decision === "et_home" ? "home" : decision === "et_away" ? "away" : null;

  const penHomeRaw = formData.get("penalty_home_score");
  const penAwayRaw = formData.get("penalty_away_score");
  // Shootout scores only make sense when the game actually went to penalties.
  const penaltyHome =
    penaltyWinner && penHomeRaw !== "" && penHomeRaw !== null
      ? Number(penHomeRaw)
      : null;
  const penaltyAway =
    penaltyWinner && penAwayRaw !== "" && penAwayRaw !== null
      ? Number(penAwayRaw)
      : null;

  const etHomeRaw = formData.get("extra_time_home_score");
  const etAwayRaw = formData.get("extra_time_away_score");
  // Extra-time scores only make sense when the game was decided in extra time.
  const extraTimeHome =
    extraTimeWinner && etHomeRaw !== "" && etHomeRaw !== null
      ? Number(etHomeRaw)
      : null;
  const extraTimeAway =
    extraTimeWinner && etAwayRaw !== "" && etAwayRaw !== null
      ? Number(etAwayRaw)
      : null;

  const payload: Record<string, number | string | null> = {
    actual_home_score: actualHome,
    actual_away_score: actualAway,
    penalty_winner: penaltyWinner,
    penalty_home_score: penaltyHome,
    penalty_away_score: penaltyAway,
    extra_time_winner: extraTimeWinner,
    extra_time_home_score: extraTimeHome,
    extra_time_away_score: extraTimeAway,
  };

  let { error } = await supabaseAdmin
    .from("matches")
    .update(payload)
    .eq("id", matchId);

  // If the live database is missing optional columns (a migration in
  // scripts/ hasn't been run yet), don't let that block saving the actual
  // score: drop the missing columns from the payload and retry.
  while (error) {
    const missing = Object.keys(payload).find((k) => error!.message.includes(k));
    if (!missing || missing.startsWith("actual_")) break;
    delete payload[missing];
    ({ error } = await supabaseAdmin
      .from("matches")
      .update(payload)
      .eq("id", matchId));
  }

  if (error) {
    // Surface the failure instead of silently showing a success state.
    throw new Error(`Tulemuse salvestamine ebaõnnestus: ${error.message}`);
  }

  revalidateAll();
}

export async function saveBonusAnswer(formData: FormData) {
  requireAuth();
  const participantId = String(formData.get("participant_id") ?? "");
  const questionId = Number(formData.get("question_id"));
  const answerText = String(formData.get("answer_text") ?? "");
  const pointsRaw = formData.get("points_awarded");

  if (!participantId || !questionId) return;

  const pointsAwarded =
    pointsRaw === "" || pointsRaw === null ? null : Number(pointsRaw);

  await supabaseAdmin.from("bonus_answers").upsert(
    {
      participant_id: participantId,
      question_id: questionId,
      answer_text: answerText,
      points_awarded: pointsAwarded,
    },
    { onConflict: "participant_id,question_id" }
  );

  revalidateAll();
}

export async function advanceBracket() {
  requireAuth();
  const { data } = await supabaseAdmin.from("matches").select("*");
  const allMatches = (data ?? []) as Match[];
  const byId = new Map(allMatches.map((m) => [m.id, m]));
  const updates = resolveBracketTeams(allMatches);
  // Never overwrite a knockout slot that already holds a real (manually
  // entered) fixture — only fill slots that are still placeholders. The
  // auto-resolver's pairing table does not match FIFA's actual bracket, so
  // confirmed fixtures are entered by hand (see scripts/r32_fixtures.sql).
  const toApply = updates.filter((u) => {
    const cur = byId.get(u.id);
    if (!cur) return false;
    return cur.home_team === "Selgub" || cur.away_team === "Selgub";
  });
  await Promise.all(
    toApply.map((u) =>
      supabaseAdmin
        .from("matches")
        .update({ home_team: u.home_team, away_team: u.away_team })
        .eq("id", u.id)
    )
  );
  revalidateAll();
}

export async function saveBonusCorrectAnswer(formData: FormData) {
  requireAuth();
  const questionId = Number(formData.get("question_id"));
  const correctAnswer = String(formData.get("correct_answer") ?? "").trim();

  if (!questionId) return;

  await supabaseAdmin
    .from("bonus_questions")
    .update({ correct_answer: correctAnswer || null })
    .eq("id", questionId);

  revalidateAll();
}
