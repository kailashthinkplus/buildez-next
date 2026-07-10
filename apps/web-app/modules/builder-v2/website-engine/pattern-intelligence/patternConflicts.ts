import type { PatternCandidate, PatternConflict } from "./patternIntelligence";

/**
 * Detects conflicts and overuse risks between selected semantic patterns.
 *
 * @example
 * const conflicts = detectPatternConflicts(ranked);
 */
export function detectPatternConflicts(rankedCandidates: readonly PatternCandidate[]): PatternConflict[] {
  const selected = rankedCandidates.filter((candidate) => candidate.score.overall >= 0.56).slice(0, 10);
  const conflicts: PatternConflict[] = [];
  for (const candidate of selected) {
    const conflicting = selected.find((other) => candidate.definition.conflictsWith.includes(other.definition.id));
    if (conflicting) {
      conflicts.push(Object.freeze({
        patternIds: [candidate.definition.id, conflicting.definition.id],
        severity: "major",
        reason: `${candidate.definition.name} conflicts with ${conflicting.definition.name}.`,
      }));
    }
  }
  const explorationCount = selected.filter((candidate) => candidate.definition.role === "exploration").length;
  if (explorationCount > 4) {
    conflicts.push(Object.freeze({
      patternIds: selected.filter((candidate) => candidate.definition.role === "exploration").map((candidate) => candidate.definition.id),
      severity: "minor",
      reason: "Too many exploration patterns can recreate generic card-grid rhythm.",
    }));
  }
  return conflicts;
}
