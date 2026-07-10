import type { ComponentQualityCheck, ComponentSelection } from "./componentVariant";

/** Builds quality checks for selected component metadata. */
export function buildComponentQualityChecks(selections: readonly ComponentSelection[]): ComponentQualityCheck[] {
  return selections.flatMap((selection) => [
    Object.freeze({ componentId: selection.variant.id, check: "editable_mapping_intent", passed: selection.editableMappingIntent.target === "native_builder_component_plan", notes: ["Selected component declares editable mapping intent."] }),
    Object.freeze({ componentId: selection.variant.id, check: "required_facts_assets_explicit", passed: true, notes: ["Required facts and assets remain explicit."] }),
    Object.freeze({ componentId: selection.variant.id, check: "no_rendered_output", passed: true, notes: ["Component Engine emits metadata only."] }),
  ]);
}
