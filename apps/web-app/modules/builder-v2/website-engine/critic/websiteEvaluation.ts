import type { CriticCategory, CriticResult, WebsiteEvaluation } from "./criticResult";

/**
 * Builds the public evaluation summary from a complete critic result.
 *
 * @example
 * const evaluation = buildWebsiteEvaluation(criticResult);
 */
export function buildWebsiteEvaluation(result: Pick<CriticResult, "overallScore" | "passed" | "previewReady" | "publishRecommended" | "categoryScores" | "hardFailures">): WebsiteEvaluation {
  const dimensions = result.categoryScores.reduce((accumulator, score) => {
    accumulator[score.category] = score.score;
    return accumulator;
  }, {} as Record<CriticCategory, number>);

  return Object.freeze({
    score: result.overallScore,
    passed: result.passed,
    previewReady: result.previewReady,
    publishRecommended: result.publishRecommended,
    requiresRepair: !result.previewReady || result.hardFailures.length > 0,
    summary: result.publishRecommended
      ? "Publish recommended by metadata critic."
      : result.previewReady
        ? "Preview-ready, but not publish-recommended yet."
        : result.hardFailures.length > 0
          ? "Blocked by hard failures that require repair."
          : "Repair required before preview readiness.",
    dimensions,
  });
}
