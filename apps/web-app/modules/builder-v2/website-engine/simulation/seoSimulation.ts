import type { SimulationInput } from "./simulationInput";
import type { SEOSimulationResult } from "./simulationResult";

/**
 * Simulates SEO basics from WebsiteSpec, compiled SEO plan, and heading metadata.
 *
 * @example
 * const seo = runSEOSimulation({ websiteSpec, compiledPlan });
 */
export function runSEOSimulation(input: SimulationInput): SEOSimulationResult {
  const nodes = input.mappingPlan?.nodeCreationPlan.map((node) => node.nativeNode) ?? [];
  const hasHeadingSignal = nodes.some((node) => node.type === "heading") || Boolean(input.compiledPlan?.sections.length);
  const hasTitleSignal = Boolean(input.websiteSpec?.business.businessName || input.builderBlueprintResult?.blueprint.nativeBlueprint.metadata.title);
  const hasDescriptionSignal = Boolean(input.compiledPlan?.seoPlan.length || input.websiteSpec?.seo.description);
  const missing = [hasTitleSignal, hasHeadingSignal, hasDescriptionSignal].filter((value) => !value).length;
  return Object.freeze({
    score: Math.max(0, 100 - missing * 25),
    hasTitleSignal,
    hasHeadingSignal,
    hasDescriptionSignal,
    notes: [
      "SEO simulation is metadata-only.",
      hasDescriptionSignal ? "SEO description/plan metadata exists." : "SEO description/plan metadata missing.",
    ],
  });
}
