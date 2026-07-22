import type {
  AccessibilitySimulationResult,
  AssetSimulationResult,
  ConversionSimulationResult,
  EditabilitySimulationResult,
  ParitySimulationResult,
  PerformanceSimulationResult,
  ResponsiveSimulationResult,
  SEOSimulationResult,
  SimulationIssue,
  SimulationScore,
  ViewportSimulationResult,
} from "./simulationResult";

/**
 * Scores the full simulation from individual metadata checks.
 *
 * @example
 * const score = scoreSimulation({ viewportResults, responsiveResult, accessibilityResult, seoResult, performanceResult, conversionResult, assetResult, editabilityResult, parityResult, issues });
 */
export function scoreSimulation(input: {
  viewportResults: ViewportSimulationResult[];
  responsiveResult: ResponsiveSimulationResult;
  accessibilityResult: AccessibilitySimulationResult;
  seoResult: SEOSimulationResult;
  performanceResult: PerformanceSimulationResult;
  conversionResult: ConversionSimulationResult;
  assetResult: AssetSimulationResult;
  editabilityResult: EditabilitySimulationResult;
  parityResult: ParitySimulationResult;
  issues: SimulationIssue[];
}): SimulationScore {
  const viewportAverage = input.viewportResults.reduce((total, result) => total + result.structureScore, 0) / Math.max(input.viewportResults.length, 1);
  const raw = Math.round((
    viewportAverage +
    input.responsiveResult.score +
    input.accessibilityResult.score +
    input.seoResult.score +
    input.performanceResult.score +
    input.conversionResult.score +
    input.assetResult.score +
    input.editabilityResult.score +
    input.parityResult.score
  ) / 9);
  const blockerPenalty = input.issues.filter((issue) => issue.severity === "blocker").length * 15;
  const majorPenalty = input.issues.filter((issue) => issue.severity === "major").length * 4;
  const score = Math.max(0, Math.min(100, raw - blockerPenalty - majorPenalty));
  const grade: SimulationScore["grade"] = score >= 85 ? "excellent" : score >= 72 ? "good" : score >= 50 ? "needs_attention" : "blocked";
  return Object.freeze({
    score,
    grade,
    reasons: [
      `Viewport average: ${Math.round(viewportAverage)}.`,
      `Major issues: ${input.issues.filter((issue) => issue.severity === "major").length}.`,
      `Blockers: ${input.issues.filter((issue) => issue.severity === "blocker").length}.`,
    ],
  });
}
