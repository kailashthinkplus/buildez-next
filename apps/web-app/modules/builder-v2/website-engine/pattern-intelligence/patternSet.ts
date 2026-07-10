import type { PatternCandidate, PatternSet } from "./patternIntelligence";

/**
 * Builds recommended semantic pattern sets from ranked candidates.
 *
 * @example
 * const sets = buildRecommendedPatternSets(ranked);
 */
export function buildRecommendedPatternSets(rankedCandidates: readonly PatternCandidate[]): PatternSet[] {
  const selected = rankedCandidates.filter((candidate) => candidate.score.overall >= 0.56);
  const byRole = new Map<string, PatternCandidate>();
  for (const candidate of selected) {
    if (!byRole.has(candidate.definition.role)) byRole.set(candidate.definition.role, candidate);
  }
  const core = [...byRole.values()].slice(0, 8);
  const conversion = selected.filter((candidate) => ["conversion", "closure", "objection-handling"].includes(candidate.definition.role)).slice(0, 5);
  return [
    Object.freeze({
      id: "pattern-set.core-journey",
      patternIds: core.map((candidate) => candidate.definition.id),
      purpose: "balanced journey rhythm across orientation, trust, exploration, conversion, and closure",
      confidence: core.length ? Number((core.reduce((sum, candidate) => sum + candidate.score.overall, 0) / core.length).toFixed(2)) : 0,
    }),
    Object.freeze({
      id: "pattern-set.conversion-support",
      patternIds: conversion.map((candidate) => candidate.definition.id),
      purpose: "conversion support without skipping trust or objection handling",
      confidence: conversion.length ? Number((conversion.reduce((sum, candidate) => sum + candidate.score.overall, 0) / conversion.length).toFixed(2)) : 0,
    }),
  ].filter((set) => set.patternIds.length);
}
