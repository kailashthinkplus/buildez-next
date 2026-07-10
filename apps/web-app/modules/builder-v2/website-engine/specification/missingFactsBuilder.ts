import type { MissingFact } from "../sdk";
import type { WebsiteSpecBuilderInput } from "./websiteSpec";

function missing(id: string, label: string, reason: string, required = true): MissingFact {
  return Object.freeze({ id, label, reason, required });
}

function dedupe(facts: readonly MissingFact[]) {
  const seen = new Set<string>();
  return facts.filter((fact) => {
    const key = String(fact.id || fact.label);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Builds explicit missing facts from all upstream sources.
 *
 * @example
 * const missingFacts = buildMissingFacts(input);
 */
export function buildMissingFacts(input: WebsiteSpecBuilderInput): MissingFact[] {
  return dedupe([
    ...(input.intent?.missingFacts ?? []),
    ...(input.businessContext?.missingFacts ?? []),
    ...(input.businessProfile?.missingBusinessFacts ?? []),
    ...(input.contentStrategy?.missingContentFacts ?? []).map((label) => missing(`content.${label}`, label, "Required by content strategy.")),
    ...(input.brandProfile?.missingBrandFacts ?? []).map((label) => missing(`brand.${label}`, label, "Required by brand intelligence.")),
    ...(input.mediaStrategy?.missingAssets ?? []).map((label) => missing(`asset.${label}`, label, "Required media asset is missing.")),
    ...(input.componentResult?.recommendedSelections.flatMap((selection) =>
      selection.requirements.missingFacts.map((label) => missing(`component.${selection.variant.id}.${label}`, label, "Required by component selection."))
    ) ?? []),
    ...(input.missingFacts ?? []),
    ...(!input.businessContext && !input.businessProfile ? [missing("business.context", "Business context", "WebsiteSpec needs business context or business intelligence.")] : []),
  ]);
}
