import type { SimulationInput } from "./simulationInput";
import type { ViewportSimulationResult } from "./simulationResult";

function ctaCount(input: SimulationInput): number {
  const nodes = input.mappingPlan?.nodeCreationPlan.map((node) => node.nativeNode) ?? [];
  const nodeCtas = nodes.filter((node) => node.type === "button" || String(node.props?.label ?? "").toLowerCase().includes("book") || String(node.props?.label ?? "").toLowerCase().includes("contact")).length;
  return Math.max(nodeCtas, input.compiledPlan?.ctaPlan.length ?? 0);
}

/**
 * Simulates desktop, tablet, and mobile structure risk using metadata only.
 *
 * @example
 * const viewports = runViewportSimulation({ mappingPlan });
 */
export function runViewportSimulation(input: SimulationInput): ViewportSimulationResult[] {
  const sections = input.compiledPlan?.sections.length ?? input.builderBlueprintResult?.metrics.sectionCount ?? 0;
  const nodes = input.mappingPlan?.nodeCreationPlan.length ?? input.builderBlueprintResult?.metrics.widgetCount ?? sections;
  const ctas = ctaCount(input);
  return (["desktop", "tablet", "mobile"] as const).map((viewport) => {
    const densityRisk = Math.min(1, nodes / (viewport === "desktop" ? 120 : viewport === "tablet" ? 90 : 70));
    const overflowRisk = Math.min(1, Math.max(0, sections - (viewport === "mobile" ? 9 : 12)) / 10);
    const structureScore = Math.max(0, Math.round(100 - densityRisk * 24 - overflowRisk * 22 - (ctas ? 0 : 18)));
    return Object.freeze({
      viewport,
      structureScore,
      ctaReachable: ctas > 0,
      overflowRisk,
      densityRisk,
      notes: [
        `${viewport} simulated without rendering.`,
        ctas > 0 ? "CTA metadata is present." : "CTA metadata is missing.",
        `Node count considered: ${nodes}.`,
      ],
    });
  });
}
