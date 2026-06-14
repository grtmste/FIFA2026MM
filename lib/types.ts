export type Stage = "group" | "r32" | "r16" | "qf" | "sf" | "final";

export const STAGE_LABELS: Record<Stage, string> = {
  group: "Alagrupp",
  r32: "1/16 finaali",
  r16: "1/8 finaali",
  qf: "Veerandfinaal",
  sf: "Poolfinaal",
  final: "Finaal",
};

export interface Participant {
  id: string;
  name: string;
  created_at: string;
}

export interface Match {
  id: number;
  stage: Stage;
  group_name: string | null;
  home_team: string;
  away_team: string;
  match_date: string | null;
  venue: string | null;
  actual_home_score: number | null;
  actual_away_score: number | null;
}

export interface Prediction {
  id: number;
  participant_id: string;
  match_id: number;
  predicted_home_score: number;
  predicted_away_score: number;
}

export interface BonusQuestion {
  id: number;
  question_text: string;
  max_points: number;
  correct_answer: string | null;
}

export interface BonusAnswer {
  id: number;
  participant_id: string;
  question_id: number;
  answer_text: string | null;
  points_awarded: number | null;
}
