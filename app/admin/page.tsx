import { isAdminAuthenticated } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { loginAction, logoutAction } from "./actions";
import AdminDashboard from "./AdminDashboard";
import {
  BonusAnswer,
  BonusQuestion,
  Match,
  Participant,
  Prediction,
} from "@/lib/types";

export const revalidate = 0;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const authenticated = isAdminAuthenticated();

  if (!authenticated) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-navy">Admin sisselogimine</h2>
        <form action={loginAction} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <input
            type="password"
            name="password"
            placeholder="Salasõna"
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-navy placeholder-slate-400 focus:border-gold focus:outline-none"
          />
          {searchParams.error && (
            <p className="text-sm text-red-500">Vale salasõna.</p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-gold px-3 py-2 text-sm font-bold text-white"
          >
            Logi sisse
          </button>
        </form>
      </div>
    );
  }

  const [
    { data: participants },
    { data: matches },
    { data: predictions },
    { data: bonusQuestions },
    { data: bonusAnswers },
  ] = await Promise.all([
    supabaseAdmin.from("participants").select("*").order("name", { ascending: true }),
    supabaseAdmin
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true, nullsFirst: false })
      .order("id", { ascending: true }),
    supabaseAdmin.from("predictions").select("*"),
    supabaseAdmin.from("bonus_questions").select("*").order("id", { ascending: true }),
    supabaseAdmin.from("bonus_answers").select("*"),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-navy">Admin</h2>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
          >
            Logi välja
          </button>
        </form>
      </div>

      <AdminDashboard
        participants={(participants ?? []) as Participant[]}
        matches={(matches ?? []) as Match[]}
        predictions={(predictions ?? []) as Prediction[]}
        bonusQuestions={(bonusQuestions ?? []) as BonusQuestion[]}
        bonusAnswers={(bonusAnswers ?? []) as BonusAnswer[]}
      />
    </div>
  );
}
