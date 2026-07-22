import type { EngineResult } from "../sdk";
import type { LearningInput, LearningResult } from "./learningResult";

export function validateLearningInput(input: LearningInput): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!input.creativeLibraryResult && !input.criticResult && !input.similarityResult && !input.repairResult && !input.selfPlayResult && !input.evolutionResult) {
    issues.push("Learning input is sparse; only missing telemetry records may be produced.");
  }
  if (input.featureFlags && Object.values(input.featureFlags).some(Boolean)) issues.push("Learning Engine must remain inert with feature flags false.");
  return Object.freeze({ valid: true, issues });
}

export function validateLearningResult(result: LearningResult): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!result.id) issues.push("Learning result requires an id.");
  if (!result.version) issues.push("Learning result requires a version.");
  if (result.rankingSignals.some((signal) => signal.score < 0 || signal.score > 1)) issues.push("Ranking signals must be normalized.");
  if (!result.generationHistory.userSignalsAvailable && !result.aggregationSummary.missingTelemetry.includes("userEditSignals")) issues.push("Missing user telemetry must be explicit.");
  if (!result.generationHistory.publishSignalsAvailable && !result.aggregationSummary.missingTelemetry.includes("publishSignals")) issues.push("Missing publish telemetry must be explicit.");
  if (!result.trace.includes("learning.metadata-only")) issues.push("Trace must include metadata-only execution.");
  if (result.persisted || result.builderMutations || result.mapperExecuted) issues.push("Learning result must not persist or mutate execution state.");
  return Object.freeze({ valid: issues.length === 0, issues });
}

export function validateLearningEngineResult(result: EngineResult<LearningResult>): { valid: boolean; issues: string[] } {
  const validation = validateLearningResult(result.data);
  const issues = [...validation.issues];
  if (result.trace.module !== "learning") issues.push("EngineResult trace module must be learning.");
  return Object.freeze({ valid: issues.length === 0, issues });
}
