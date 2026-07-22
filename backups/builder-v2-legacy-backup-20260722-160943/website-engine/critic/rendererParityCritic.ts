import type { CriticInput } from "./criticInput";
import { createCategoryResult, hardFailure, metadataIssue, repairRecommendation } from "./criticScoring";
import type { CriticCategoryResult } from "./criticResult";

/**
 * Evaluates renderer parity metadata without rendering or screenshots.
 *
 * @example
 * const result = runRendererParityCritic({ rendererParityResult });
 */
export function runRendererParityCritic(input: CriticInput): CriticCategoryResult {
  const parity = input.rendererParityResult;
  const blockerCount = parity?.issues.filter((issue) => issue.severity === "blocker").length ?? 0;
  const majorCount = parity?.issues.filter((issue) => issue.severity === "major").length ?? 0;
  const unsupportedCount = parity?.metrics.unsupportedWidgetTypeCount ?? input.simulationResult?.parityResult.unsupportedWidgetTypeCount ?? 0;
  const issues = [];
  const hardFailures = [];
  const recommendations = [];

  if (blockerCount > 0 || unsupportedCount > 0 || input.simulationResult?.parityResult.parityReady === false) {
    hardFailures.push(hardFailure("renderer-parity", "RENDERER_PARITY_CRITICAL_ISSUE", "Renderer parity critical issue detected.", "Repair unsupported widgets, mapper compatibility, and target coverage before publish."));
  }
  if (majorCount > 0) {
    issues.push(metadataIssue("renderer-parity", "major", "Renderer parity has major metadata issues.", "Repair style, responsive, asset, or motion metadata for parity targets."));
  }
  if (!parity) {
    recommendations.push(repairRecommendation("renderer-parity", "high", "Run renderer parity metadata checks.", "Provide parity result before publish recommendation."));
  }

  return createCategoryResult("renderer-parity", input.simulationResult?.parityResult.score ?? (parity?.parityReady ? 92 : 72), [
    `Parity blocker count: ${blockerCount}.`,
    `Unsupported widget type count: ${unsupportedCount}.`,
  ], issues, hardFailures, recommendations, 1.2);
}
