import type { EngineResult } from "../sdk";
import type { EvolutionInput, EvolutionResult } from "./candidateVariants";

/**
 * Validates Candidate Evolution input without requiring full upstream pipeline data.
 *
 * @example
 * const validation = validateEvolutionInput(input);
 */
export function validateEvolutionInput(input: EvolutionInput): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!input.creativeLibraryResult && !input.designDNA && !input.compiledPlan && !input.criticResult && !input.similarityResult) {
    issues.push("Evolution input is sparse; candidates will use baseline metadata.");
  }
  if (input.featureFlags && Object.values(input.featureFlags).some(Boolean)) {
    issues.push("Candidate Evolution must remain inert with feature flags false.");
  }
  return Object.freeze({ valid: true, issues });
}

/**
 * Validates Candidate Evolution result shape.
 *
 * @example
 * const validation = validateEvolutionResult(result);
 */
export function validateEvolutionResult(result: EvolutionResult): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!result.id) issues.push("Evolution result requires an id.");
  if (!result.version) issues.push("Evolution result requires a version.");
  if (result.candidates.length < 5) issues.push("Evolution must generate at least five candidates.");
  if (!result.winner) issues.push("Evolution winner is required.");
  if (!result.runnerUps.length) issues.push("Runner-ups must be preserved.");
  if (!result.selectionReason) issues.push("Selection reason is required.");
  if (!result.repairPriority.length) issues.push("Repair priority is required.");
  if (result.ranking.length !== result.candidates.length) issues.push("Ranking must include every candidate.");
  if (result.candidateScores.some((score) => score.overallScore < 0 || score.overallScore > 100)) issues.push("Candidate scores must be normalized.");
  if (!result.trace.includes("evolution.metadata-only")) issues.push("Trace metadata must record metadata-only execution.");
  if (result.rendered || result.persisted || result.builderNodesCreated || result.mapperExecuted) issues.push("Evolution result must remain inert.");
  return Object.freeze({ valid: issues.length === 0, issues });
}

/**
 * Validates EngineResult<EvolutionResult>.
 *
 * @example
 * const validation = validateEvolutionEngineResult(result);
 */
export function validateEvolutionEngineResult(result: EngineResult<EvolutionResult>): { valid: boolean; issues: string[] } {
  const validation = validateEvolutionResult(result.data);
  const issues = [...validation.issues];
  if (result.trace.module !== "evolution") issues.push("EngineResult trace module must be evolution.");
  return Object.freeze({ valid: issues.length === 0, issues });
}
