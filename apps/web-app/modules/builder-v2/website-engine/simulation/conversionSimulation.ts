import type { SimulationInput } from "./simulationInput";
import type { ConversionSimulationResult } from "./simulationResult";

/**
 * Simulates conversion friction using CTA and section-order metadata only.
 *
 * @example
 * const conversion = runConversionSimulation({ compiledPlan });
 */
export function runConversionSimulation(input: SimulationInput): ConversionSimulationResult {
  const buttonNodes = input.mappingPlan?.nodeCreationPlan.filter((node) => node.nodeType === "button") ?? [];
  const ctaCount = Math.max(buttonNodes.length, input.compiledPlan?.ctaPlan.length ?? 0);
  const firstCtaOrder = buttonNodes.length ? Math.min(...buttonNodes.map((node) => node.order)) : 999;
  const aboveFoldCta = ctaCount > 0 && firstCtaOrder <= 8;
  const missingFacts = (input.compiledPlan?.missingFacts.length ?? 0) + (input.websiteSpec?.missingFacts.length ?? 0);
  const frictionRisk = Math.min(1, (aboveFoldCta ? 0 : 0.45) + Math.min(0.35, missingFacts * 0.05));
  return Object.freeze({
    score: Math.max(0, Math.round(100 - frictionRisk * 70)),
    aboveFoldCta,
    ctaCount,
    frictionRisk,
    notes: [
      "Conversion simulation is metadata-only.",
      aboveFoldCta ? "CTA appears early in node metadata." : "Above-the-fold CTA is not proven by metadata.",
      `${missingFacts} missing fact references considered.`,
    ],
  });
}
