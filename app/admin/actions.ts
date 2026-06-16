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

  await supabaseAdmin.from("participants").update({ name }).eq("id", id);
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

  await supabaseAdmin
    .from("matches")
    .update({
      actual_home_score: actualHome,
      actual_away_score: actualAway,
    })
    .eq("id", matchId);

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
  const updates = resolveBracketTeams(allMatches);
  await Promise.all(
    updates.map((u) =>
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
