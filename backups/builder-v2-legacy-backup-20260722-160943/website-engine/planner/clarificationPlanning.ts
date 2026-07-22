import type { PlannerClarification, PlannerMissingFact } from "./plannerResult";

/**
 * Builds clarification questions for critical missing facts.
 *
 * @example
 * const questions = buildClarificationPlan(missingFacts);
 */
export function buildClarificationPlan(missingFacts: readonly PlannerMissingFact[]): PlannerClarification[] {
  return missingFacts
    .filter((fact) => fact.required || fact.severity === "major" || fact.severity === "blocker")
    .map((fact) => Object.freeze({
      id: `clarification.${fact.id}`,
      question: `Please provide ${fact.label.toLowerCase()} so the Website Engine can plan safely.`,
      missingFactIds: [fact.id],
      blocking: fact.required,
    }));
}
