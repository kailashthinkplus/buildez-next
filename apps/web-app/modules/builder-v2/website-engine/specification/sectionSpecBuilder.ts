import type { SectionSpec } from "../sdk";
import type { SectionSpecBuildInput } from "./websiteSpec";

/**
 * Builds canonical section specs without creating UI, code, or Builder nodes.
 *
 * @example
 * const sections = buildSectionSpecs({ compositionResult });
 */
export function buildSectionSpecs(input: SectionSpecBuildInput): SectionSpec[] {
  const compositionSections = input.compositionResult?.orderedSectionSequence ?? [];
  if (compositionSections.length) {
    return compositionSections.map((section, index) => Object.freeze({
      id: section.id,
      type: section.category,
      purpose: section.purpose,
      requiredContentFields: section.requiredFacts,
      requiredAssetIds: section.requiredAssets,
      editable: true,
      patternRefs: input.patternIntelligence?.selectedPatterns[index]?.patternId ? [input.patternIntelligence.selectedPatterns[index].patternId] : [],
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
