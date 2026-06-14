import { Match, Prediction } from "./types";

/**
 * 3p exact score, 1p correct outcome (incl. draw vs draw), 0p otherwise.
 * A predicted draw only scores if the match actually ended in a draw, and
 * vice versa.
 */
export function calcMatchPoints(prediction: Prediction, match: Match): number {
  if (match.actual_home_score === null || match.actual_away_score === null) {
    return 0;
  }

  const { predicted_home_score: ph, predicted_away_score: pa } = prediction;
  const { actual_home_score: ah, actual_away_score: aw } = match;

  if (ph === ah && pa === aw) return 3;

  const predictedOutcome = Math.sign(ph - pa);
  const actualOutcome = Math.sign(ah - aw);

  if (predictedOutcome === actualOutcome) return 1;

  return 0;
}
