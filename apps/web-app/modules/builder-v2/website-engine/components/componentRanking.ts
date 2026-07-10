import type { ComponentCandidate } from "./componentVariant";

/** Ranks component candidates by deterministic score. */
export function rankComponentCandidates(candidates: readonly ComponentCandidate[]): ComponentCandidate[] {
  return [...candidates].sort((left, right) => right.score.overall - left.score.overall || left.variant.id.localeCompare(right.variant.id));
}
