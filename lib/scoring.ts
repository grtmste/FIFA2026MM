import { Match, Prediction } from "./types";

// Rounds scored with the raised 4p/2p scheme. Group stage and 1/32 keep the
// original 3p/1p scoring.
const RAISED_STAGES = new Set<Match["stage"]>(["r16", "qf", "sf", "final"]);

/**
 * Group stage & 1/32: 3p exact score, 1p correct outcome.
 * From 1/16 onward:   4p exact score, 2p correct outcome.
 * A predicted draw only scores if the match actually ended in a draw, and
 * vice versa. Scores are always compared on normal time.
 */
export function calcMatchPoints(prediction: Prediction, match: Match): number {
  if (match.actual_home_score === null || match.actual_away_score === null) {
    return 0;
  }

  const raised = RAISED_STAGES.has(match.stage);
  const exactPoints = raised ? 4 : 3;
  const outcomePoints = raised ? 2 : 1;

  const { predicted_home_score: ph, predicted_away_score: pa } = prediction;
  const { actual_home_score: ah, actual_away_score: aw } = match;

  if (ph === ah && pa === aw) return exactPoints;

  const predictedOutcome = Math.sign(ph - pa);
  const actualOutcome = Math.sign(ah - aw);

  if (predictedOutcome === actualOutcome) return outcomePoints;

  return 0;
}
