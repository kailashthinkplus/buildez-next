import type { InspirationConfidence, InspirationMatch } from "./inspirationProfile";

export function scoreInspirationMatches(matches: readonly InspirationMatch[]): InspirationConfidence {
  const top = [...matches].sort((left, right) => right.score.overall - left.score.overall).slice(0, 4);
  const average = top.length ? top.reduce((sum, match) => sum + match.score.overall, 0) / top.length : 0;
  return Object.freeze({
    score: Math.max(0, Math.min(1, Number(average.toFixed(2)))),
    reasons: [`topMatchAverage=${average.toFixed(2)}`, `matchCount=${matches.length}`],
  });
}
