import type { SimulationInput } from "./simulationInput";
import type { ResponsiveSimulationResult } from "./simulationResult";

/**
 * Simulates responsive readiness from mapping, blueprint, and compiled responsive metadata.
 *
 * @example
 * const responsive = runResponsiveSimulation({ mappingPlan });
 */
export function runResponsiveSimulation(input: SimulationInput): ResponsiveSimulationResult {
  const breakpoints = new Set<string>([
    ...(input.compiledPlan?.responsivePlan.map((rule) => rule.breakpoint) ?? []),
    ...(input.builderBlueprintResult?.responsiveBindings.flatMap((binding) => Object.keys(binding.overrides)) ?? []),
    ...(input.mappingPlan?.responsivePlan.flatMap((plan) => plan.breakpoints) ?? []),
  ]);
  const hasDesktop = breakpoints.has("desktop") || Boolean(input.mappingPlan?.responsivePlan.length);
  const hasTablet = breakpoints.has("tablet");
  const hasMobile = breakpoints.has("mobile");
  const missingCount = [hasDesktop, hasTablet, hasMobile].filter((value) => !value).length;
  const stackingRisk = Math.min(1, missingCount / 3);
  return Object.freeze({
    score: Math.max(0, Math.round(100 - stackingRisk * 60)),
    hasDesktop,
    hasTablet,
    hasMobile,
    stackingRisk,
    notes: [
      "Responsive simulation is metadata-only.",
      hasMobile ? "Mobile metadata found." : "Mobile metadata missing.",
      hasTablet ? "Tablet metadata found." : "Tablet metadata missing.",
    ],
  });
}
