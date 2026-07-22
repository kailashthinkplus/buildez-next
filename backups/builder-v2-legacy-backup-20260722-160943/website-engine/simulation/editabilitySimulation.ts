import type { SimulationInput } from "./simulationInput";
import type { EditabilitySimulationResult } from "./simulationResult";

/**
 * Simulates editability risk from mapper and Builder Blueprint metadata.
 *
 * @example
 * const editability = runEditabilitySimulation({ builderBlueprintResult, mappingPlan });
 */
export function runEditabilitySimulation(input: SimulationInput): EditabilitySimulationResult {
  const totalNodeCount = input.mappingPlan?.nodeCreationPlan.length ?? input.builderBlueprintResult?.metrics.widgetCount ?? 0;
  const editableNodeCount = input.mappingPlan?.nodeCreationPlan.filter((node) => node.editable).length ?? input.builderBlueprintResult?.editablePropertyBindings.length ?? 0;
  const inspectorBindings = input.builderBlueprintResult?.editablePropertyBindings.length ?? input.mappingPlan?.propertyPlan.length ?? 0;
  const missingInspectorBindingRisk = totalNodeCount ? Math.max(0, 1 - inspectorBindings / Math.max(totalNodeCount, 1)) : 1;
  const editableRatio = totalNodeCount ? editableNodeCount / totalNodeCount : 0;
  return Object.freeze({
    score: Math.max(0, Math.round(100 - (1 - editableRatio) * 40 - missingInspectorBindingRisk * 35)),
    editableNodeCount,
    totalNodeCount,
    missingInspectorBindingRisk,
    notes: [
      "Editability simulation does not insert or mutate Builder nodes.",
      `${editableNodeCount}/${totalNodeCount} nodes or widgets have editability metadata.`,
    ],
  });
}
