import type { PlannerInput } from "./plannerInput";
import type { PlannerModulePlan } from "./plannerResult";

const moduleOrder: Array<PlannerModulePlan["module"]> = [
  "business-intelligence",
  "brand-intelligence",
  "content-intelligence",
  "experience",
  "pattern-intelligence",
  "design",
  "creative-library",
  "design-dna",
  "components",
  "composition",
  "specification",
  "compiler",
  "builder-blueprint",
  "mapper",
  "simulation",
  "critic",
  "similarity",
  "evolution",
  "repair",
  "self-play",
  "learning",
];

/**
 * Builds an ordered inert Website Engine module plan.
 *
 * @example
 * const modules = buildModulePlan(input);
 */
export function buildModulePlan(_input: PlannerInput): PlannerModulePlan[] {
  return moduleOrder.map((module, index) => Object.freeze({
    module,
    order: index + 1,
    enabled: module !== "mapper",
    executionGate: module === "mapper" ? "disabled" as const : "manual-only" as const,
    reason: module === "mapper" ? "Mapper execution remains disabled by feature flag." : `Plan ${module} metadata stage.`,
    requiredInputs: index === 0 ? ["PlannerIntent", "PlannerFact[]"] : ["Previous module metadata"],
    expectedOutputs: [`${module} metadata`],
  }));
}
