import type { SimulationInput } from "./simulationInput";
import type { AccessibilitySimulationResult } from "./simulationResult";

/**
 * Simulates accessibility risk from native node props and motion strategy metadata.
 *
 * @example
 * const accessibility = runAccessibilitySimulation({ mappingPlan, motionStrategy });
 */
export function runAccessibilitySimulation(input: SimulationInput): AccessibilitySimulationResult {
  const nodes = input.mappingPlan?.nodeCreationPlan.map((node) => node.nativeNode) ?? [];
  const imageNodes = nodes.filter((node) => node.type === "image");
  const missingAlt = imageNodes.filter((node) => !node.props?.alt).length;
  const buttonNodes = nodes.filter((node) => node.type === "button");
  const missingLabels = buttonNodes.filter((node) => !node.props?.label && !node.props?.text).length;
  const missingAltRisk = imageNodes.length ? missingAlt / imageNodes.length : 0;
  const interactiveLabelRisk = buttonNodes.length ? missingLabels / buttonNodes.length : 0;
  const reducedMotionCovered = input.motionStrategy?.reducedMotion.required === true || Boolean(input.builderBlueprintResult?.motionBindings.length);
  return Object.freeze({
    score: Math.max(0, Math.round(100 - missingAltRisk * 30 - interactiveLabelRisk * 30 - (reducedMotionCovered ? 0 : 12))),
    missingAltRisk,
    interactiveLabelRisk,
    reducedMotionCovered,
    notes: [
      "Accessibility simulation did not inspect DOM.",
      `${missingAlt} image nodes lack explicit alt metadata.`,
      reducedMotionCovered ? "Reduced-motion metadata is present." : "Reduced-motion metadata is missing.",
    ],
  });
}
