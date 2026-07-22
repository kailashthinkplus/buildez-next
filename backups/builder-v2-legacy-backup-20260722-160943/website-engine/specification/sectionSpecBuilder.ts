import type { SectionSpec } from "../sdk";
import type { SectionSpecBuildInput } from "./websiteSpec";

export type SectionAssociationDiagnostic = Readonly<{ code: "MISSING_STABLE_SECTION_ASSOCIATION"; sectionId: string; message: string }>;

export function buildSectionSpecsWithDiagnostics(input: SectionSpecBuildInput): Readonly<{ sections: SectionSpec[]; diagnostics: SectionAssociationDiagnostic[] }> {
  const diagnostics: SectionAssociationDiagnostic[] = [];
  const compositionSections = input.compositionResult?.orderedSectionSequence ?? [];
  if (!compositionSections.length) return { sections: buildSectionSpecs(input), diagnostics };
  const scopedById = new Map((input.componentResult?.sectionSelections ?? []).map((item) => [item.section.id, item.section.patternId]));
  const patterns = input.patternIntelligence?.selectedPatterns ?? [];
  const sections = compositionSections.map((section) => {
    const scopedPattern = scopedById.get(section.id);
    const identityPattern = patterns.find((pattern) => section.id === `section.${pattern.patternId}` || section.id.startsWith(`section.${pattern.patternId}.`))?.patternId;
    const patternId = scopedPattern ?? identityPattern;
    if (!patternId) diagnostics.push(Object.freeze({ code: "MISSING_STABLE_SECTION_ASSOCIATION", sectionId: section.id, message: `No stable section-to-pattern association exists for ${section.id}; component ID fallback is forbidden.` }));
    return Object.freeze({ id: section.id, type: section.category, purpose: section.purpose, requiredContentFields: section.requiredFacts, requiredAssetIds: section.requiredAssets, editable: true, patternRefs: patternId ? [patternId] : [], componentVariantRef: section.componentId });
  });
  return Object.freeze({ sections, diagnostics });
}

/**
 * Builds canonical section specs without creating UI, code, or Builder nodes.
 *
 * @example
 * const sections = buildSectionSpecs({ compositionResult });
 */
export function buildSectionSpecs(input: SectionSpecBuildInput): SectionSpec[] {
  const compositionSections = input.compositionResult?.orderedSectionSequence ?? [];
  if (compositionSections.length) {
    const scopedById = new Map((input.componentResult?.sectionSelections ?? []).map((item) => [item.section.id, item.section.patternId]));
    const patterns = input.patternIntelligence?.selectedPatterns ?? [];
    return compositionSections.map((section) => Object.freeze({
      id: section.id,
      type: section.category,
      purpose: section.purpose,
      requiredContentFields: section.requiredFacts,
      requiredAssetIds: section.requiredAssets,
      editable: true,
      patternRefs: (() => { const patternId = scopedById.get(section.id) ?? patterns.find((pattern) => section.id === `section.${pattern.patternId}` || section.id.startsWith(`section.${pattern.patternId}.`))?.patternId; return patternId ? [patternId] : []; })(),
      componentVariantRef: section.componentId,
    }));
  }

  const selectedPatterns = input.patternIntelligence?.selectedPatterns ?? [];
  if (selectedPatterns.length) {
    return selectedPatterns.map((pattern, index) => Object.freeze({
      id: `section.${index}.${pattern.patternId.replaceAll(".", "_")}`,
      type: pattern.patternId.split(".").pop() ?? "section",
      purpose: pattern.reason,
      requiredContentFields: pattern.satisfies,
      requiredAssetIds: [],
      editable: true,
      patternRefs: [pattern.patternId],
    }));
  }

  const decisionPatterns = input.decisionPlan?.selectedPatternSet ?? [];
  return decisionPatterns.map((patternId, index) => Object.freeze({
    id: `section.${index}.${patternId.replaceAll(".", "_")}`,
    type: patternId.split(".").pop() ?? "section",
    purpose: `Support ${input.decisionPlan?.selectedWebsiteGoal ?? "website goal"} through ${patternId}.`,
    requiredContentFields: [],
    requiredAssetIds: [],
    editable: true,
    patternRefs: [patternId],
  }));
}
