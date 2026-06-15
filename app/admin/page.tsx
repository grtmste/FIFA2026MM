import { isAdminAuthenticated } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { loginAction, logoutAction } from "./actions";
import AdminDashboard from "./AdminDashboard";
import SubmitButton from "@/components/SubmitButton";
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
      <div className="mx-auto max-w-sm space-y-4">
        <div className="text-center">
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-gold-dark text-2xl shadow-card">
            🔒
          </span>
          <h2 className="text-xl font-bold text-navy">Admin sisselogimine</h2>
          <p className="mt-1 text-sm text-slate-500">
            Sisesta salasõna jätkamiseks
          </p>
        </div>
        <form
          action={loginAction}
          className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
        >
          <input
            type="password"
            name="password"
            placeholder="Salasõna"
            required
            autoFocus
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-navy placeholder-slate-400 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          />
          {searchParams.error && (
            <p className="text-sm text-red-500">Vale salasõna.</p>
          )}
          <SubmitButton variant="primary" className="w-full py-2.5 text-sm">
            Logi sisse
          </SubmitButton>
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
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 active:scale-95"
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
