import type { PlannerInput } from "./plannerInput";
import type { PlannerFact, PlannerMissingFact } from "./plannerResult";

function fact(id: string, label: string, value: unknown, source: PlannerFact["source"]): PlannerFact | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return Object.freeze({ id, label, value: JSON.parse(JSON.stringify(value)), source });
}

/**
 * Extracts known planner facts from structured inputs.
 *
 * @example
 * const facts = extractPlannerFacts({ businessHints: { name: "Acme" } });
 */
export function extractPlannerFacts(input: PlannerInput): PlannerFact[] {
  return [
    fact("fact.prompt", "User prompt", input.prompt, "prompt"),
    fact("fact.business.name", "Business name", input.businessContext?.businessName ?? input.businessHints?.name, input.businessContext ? "existing-state" : "context"),
    fact("fact.business.family", "Business family", input.businessContext?.family, "existing-state"),
    fact("fact.location", "Location", input.businessContext?.location ?? input.businessHints?.location, input.businessContext?.location ? "existing-state" : "context"),
    ...(input.mockedPlan?.knownFacts ? Object.entries(input.mockedPlan.knownFacts).map(([key, value]) => Object.freeze({ id: `fact.mocked.${key}`, label: key, value, source: "mocked-plan" as const })) : []),
  ].filter((item): item is PlannerFact => Boolean(item));
}

/**
 * Collects missing planner facts without inventing values.
 *
 * @example
 * const missing = collectPlannerMissingFacts(input);
 */
export function collectPlannerMissingFacts(input: PlannerInput): PlannerMissingFact[] {
  const missing: PlannerMissingFact[] = [];
  if (!input.businessContext?.businessName && !input.businessHints?.name) missing.push({ id: "missing.business.name", label: "Business name", required: true, reason: "Needed for brand and content strategy.", severity: "major", source: "planner" });
  if (!input.businessContext?.location && !input.businessHints?.location) missing.push({ id: "missing.location", label: "Primary location", required: false, reason: "Improves locality and SEO when relevant.", severity: "minor", source: "planner" });
  if (!input.prompt?.trim() && !input.intentClassification && !input.mockedPlan?.intent) missing.push({ id: "missing.prompt", label: "User request", required: true, reason: "Planner needs a request, classification, or mocked plan.", severity: "major", source: "planner" });
  for (const item of input.intentClassification?.missingFacts ?? []) missing.push({ ...item, source: "classification" });
  for (const item of input.businessContext?.missingFacts ?? []) missing.push({ ...item, source: "business-context" });
  for (const item of input.mockedPlan?.missingFacts ?? []) {
    missing.push({ id: item.id ?? "missing.mocked", label: item.label ?? "Mocked missing fact", required: item.required ?? true, reason: item.reason ?? "Provided by mocked plan.", severity: item.severity, source: "mocked-plan" });
  }
  return missing;
}
