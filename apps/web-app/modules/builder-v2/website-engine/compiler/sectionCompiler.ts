import type { CompilerInput, CompiledSection } from "./compiledPlan";
import { compileContentRoles } from "./contentCompiler";

function missingFactLabels(input: CompilerInput) {
  return [
    ...(input.websiteSpec?.missingFacts ?? []).map((fact) => fact.label ?? String(fact.id)),
    ...(input.businessProfile?.missingBusinessFacts ?? []).map((fact) => fact.label),
    ...(input.brandProfile?.missingBrandFacts ?? []),
    ...(input.contentStrategy?.missingContentFacts ?? []),
  ];
}

export function compileExperienceRoles(input: CompilerInput, sectionIds: readonly string[]) {
  const stages = input.experienceStrategy?.journeyStages ?? [];
  const attention = input.experienceStrategy?.attentionCurve ?? [];
  const trust = input.experienceStrategy?.trustCurve ?? [];
  return sectionIds.map((sectionId, index) => Object.freeze({
    sectionId,
    journeyStage: stages[index % Math.max(stages.length, 1)] ?? "orientation",
    attentionRole: attention[index % Math.max(attention.length, 1)] ?? "maintain clarity",
    trustRole: trust[index % Math.max(trust.length, 1)] ?? "preserve trust",
  }));
}

export function compilePatternRoles(input: CompilerInput, sectionIds: readonly string[]) {
  const patterns = input.patternIntelligence?.selectedPatterns ?? [];
  return sectionIds.map((sectionId, index) => {
    const pattern = patterns[index % Math.max(patterns.length, 1)];
    return Object.freeze({ sectionId, patternId: pattern?.patternId ?? "pattern.unspecified", role: pattern?.satisfies.join(", ") ?? "support journey", risks: pattern?.risks ?? [] });
  });
}

export function compileSections(input: CompilerInput): CompiledSection[] {
  const compositionSections = input.compositionResult?.orderedSectionSequence ?? [];
  const fallbackPatterns = input.decisionPlan.selectedPatternSet.length ? input.decisionPlan.selectedPatternSet : ["pattern.generic"];
  const baseSections = compositionSections.length
    ? compositionSections.map((section, index) => ({ id: section.id, type: section.category, purpose: section.purpose, patternId: input.patternIntelligence?.selectedPatterns[index]?.patternId ?? section.category, componentVariantIds: [section.componentId], componentFamilyIds: [section.family], requiredContentFields: section.requiredFacts, requiredAssetIds: section.requiredAssets, order: index, metadata: { source: "composition" } }))
    : fallbackPatterns.map((patternId, index) => ({ id: `compiled-section.${index}.${String(patternId).replaceAll(".", "_")}`, type: String(patternId).split(".").pop() ?? "section", purpose: `Support ${input.decisionPlan.selectedWebsiteGoal} using ${patternId}.`, patternId, componentVariantIds: [], componentFamilyIds: input.decisionPlan.selectedComponentFamilies, requiredContentFields: [], requiredAssetIds: [], order: index, metadata: { source: "decisionPlan" } }));
  const sectionIds = baseSections.map((section) => String(section.id));
  const contentRoles = compileContentRoles(input, sectionIds);
  const experienceRoles = compileExperienceRoles(input, sectionIds);
  const patternRoles = compilePatternRoles(input, sectionIds);
  return baseSections.map((section, index) => Object.freeze({
    ...section,
    missingFacts: missingFactLabels(input),
    editable: true,
    mapperIntent: "native-editable-section" as const,
    contentRole: contentRoles[index],
    experienceRole: experienceRoles[index],
    patternRole: patternRoles[index],
  }));
}
