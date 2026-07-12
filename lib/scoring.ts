import { Match, Prediction } from "./types";

// Per-round scoring: [exact score, correct outcome].
const STAGE_POINTS: Record<Match["stage"], [number, number]> = {
  group: [3, 1],
  r32: [3, 1],
  r16: [4, 2],
  qf: [5, 3],
  sf: [5, 3],
  third: [5, 3],
  final: [5, 3],
};

/**
 * Points per round: alagrupp & 1/32 = 3p/1p, 1/16 = 4p/2p,
 * veerandfinaal onward = 5p/3p (exact score / correct outcome).
 * A predicted draw only scores if the match actually ended in a draw, and
 * vice versa. Scores are always compared on normal time.
 */
export function calcMatchPoints(prediction: Prediction, match: Match): number {
  // Admin-set manual correction wins over automatic scoring.
  if (prediction.points_override !== null && prediction.points_override !== undefined) {
    return prediction.points_override;
  }
  if (match.actual_home_score === null || match.actual_away_score === null) {
    return 0;
  }

  const [exactPoints, outcomePoints] = STAGE_POINTS[match.stage] ?? [3, 1];

  const { predicted_home_score: ph, predicted_away_score: pa } = prediction;
  const { actual_home_score: ah, actual_away_score: aw } = match;

  if (ph === ah && pa === aw) return exactPoints;

  const predictedOutcome = Math.sign(ph - pa);
  const actualOutcome = Math.sign(ah - aw);

  if (predictedOutcome === actualOutcome) return outcomePoints;

  return 0;
}
