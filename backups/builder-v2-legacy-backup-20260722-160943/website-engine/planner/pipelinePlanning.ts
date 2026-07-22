import type { PlannerClarification, PlannerPipelinePlan } from "./plannerResult";
import type { PlannerModulePlan } from "./plannerResult";

/**
 * Builds the inert pipeline plan.
 *
 * @example
 * const pipeline = buildPipelinePlan(modules, clarifications);
 */
export function buildPipelinePlan(modules: readonly PlannerModulePlan[], clarifications: readonly PlannerClarification[]): PlannerPipelinePlan {
  return Object.freeze({
    id: "planner.pipeline.website-engine.metadata",
    modules: [...modules],
    disabledExecutionGates: [
      "website-engine-feature-flag",
      "mapper-execution",
      "builder-store-mutation",
      "production-route-wiring",
      "live-llm-calls",
      "db-network-provider-calls",
    ],
    requiresClarification: clarifications.some((question) => question.blocking),
    metadataOnly: true as const,
  });
}
