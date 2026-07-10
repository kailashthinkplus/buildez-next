import type { CompilerInput, CompiledComponent, CompiledSection } from "./compiledPlan";

export function compileComponents(input: CompilerInput, sections: readonly CompiledSection[]): CompiledComponent[] {
  const selections = input.componentResult?.recommendedSelections ?? [];
  if (selections.length) {
    return selections.map((selection, index) => Object.freeze({
      id: `compiled-component.${selection.variant.id}`,
      category: selection.variant.category,
      componentFamilyId: selection.variant.family,
      componentVariantId: selection.variant.id,
      sectionId: sections[index % Math.max(sections.length, 1)]?.id,
      editableMappingIntent: selection.editableMappingIntent,
      requiredProps: selection.editableMappingIntent.editableFields,
      forbiddenOutputs: ["builder-node", "html", "react-component", "css", "js"],
      metadata: { label: selection.variant.label, requiredFacts: selection.requirements.requiredFacts, requiredAssets: selection.requirements.requiredAssets },
    }));
  }
  const families = input.decisionPlan.selectedComponentFamilies.length ? input.decisionPlan.selectedComponentFamilies : ["component.editable_generic"];
  return families.map((family, index) => Object.freeze({
    id: `compiled-component.${index}.${String(family).replaceAll(".", "_")}`,
    category: String(family).split(".")[0] || "component",
    componentFamilyId: family,
    componentVariantId: String(family),
    sectionId: sections[index % Math.max(sections.length, 1)]?.id,
    editableMappingIntent: { target: "native_builder_component_plan" as const, editableFields: ["content", "cta", "assets"], repeatableRegions: [], assetSlots: [], notes: ["Fallback editable mapping intent."] },
    requiredProps: ["content", "cta", "assets"],
    forbiddenOutputs: ["builder-node", "html", "react-component", "css", "js"],
    metadata: { selectedArchetype: input.decisionPlan.selectedArchetype },
  }));
}
