import type { PlannerResult, PlannerTrace } from "./plannerResult";

/**
 * Builds planner trace metadata.
 *
 * @example
 * const trace = buildPlannerTrace(result);
 */
export function buildPlannerTrace(result: Pick<PlannerResult, "interpretedIntent" | "knownFacts" | "missingFacts" | "orderedModulePlan">): PlannerTrace {
  return Object.freeze({
    events: [
      "planner.metadata-only",
      result.interpretedIntent ? `intent.${result.interpretedIntent.source}` : "intent.missing",
      `known-facts.${result.knownFacts.length}`,
      `missing-facts.${result.missingFacts.length}`,
      `modules.${result.orderedModulePlan.length}`,
      "no-live-llm-calls",
      "no-builder-mutation",
      "no-production-wiring",
    ],
    metadata: {
      confidence: result.interpretedIntent?.confidence ?? 0,
    },
  });
}
