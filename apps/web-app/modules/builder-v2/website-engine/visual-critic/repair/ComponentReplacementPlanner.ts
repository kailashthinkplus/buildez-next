import { ComponentVariantCompilerRegistry } from "../../builder-blueprint/component-recipes";
import { buildComponentCatalog } from "../../components/componentCatalog";
import type { ComponentVariant } from "../../components/componentVariant";
import { componentPattern, sectionComponentId, type VisualCriticInput, type VisualCriticSection } from "../VisualCriticRule";
import type { VisualCriticIssue, VisualRepairRecommendation } from "../VisualCriticResult";

const catalog = Object.freeze(buildComponentCatalog());
const nativeCompilerIds = new Set<string>(ComponentVariantCompilerRegistry.ids());

function candidateScore(candidate: ComponentVariant, input: VisualCriticInput, issue: VisualCriticIssue): number {
  const direction = input.designExecutionPlan?.visualDirection.toLowerCase() ?? "";
  let score = 0;
  if (input.businessFamily && candidate.metadata.compatibleFamilies.includes(input.businessFamily as never)) score += 4;
  if (input.archetype && candidate.metadata.compatibleArchetypes.includes(input.archetype as never)) score += 3;
  if (candidate.metadata.tags.some((tag) => direction.includes(tag))) score += 2;
  if (/premium|editorial|media|story/.test(`${direction} ${issue.violation ?? ""}`) && candidate.metadata.tags.some((tag) => /premium|editorial|project/.test(tag))) score += 3;
  if (nativeCompilerIds.has(candidate.id)) score += 1;
  return score;
}

function replacementCandidates(section: VisualCriticSection, issue: VisualCriticIssue): ComponentVariant[] {
  const current = catalog.find((candidate) => candidate.id === sectionComponentId(section));
  if (componentPattern(section) === "hero") return catalog.filter((candidate) => candidate.family === "hero" || candidate.category === "booking" || candidate.category === "appointment").filter((candidate) => candidate.id !== current?.id);
  if (issue.id === "issue.repeated-grids") return catalog.filter((candidate) => ["FounderStorySplit01", "ProcessTimeline01", "ProjectShowcaseEditorial01", "GalleryLifestyleRail01", "ProductFeatureStack01"].includes(candidate.id));
  if (issue.category === "media") return catalog.filter((candidate) => candidate.family === "gallery");
  return [];
}

export function planComponentReplacement(issue: VisualCriticIssue, section: VisualCriticSection, input: VisualCriticInput, index: number): VisualRepairRecommendation | undefined {
  const current = sectionComponentId(section);
  const candidates = replacementCandidates(section, issue)
    .map((candidate) => ({ candidate, score: candidateScore(candidate, input, issue) }))
    .sort((a, b) => b.score - a.score || a.candidate.id.localeCompare(b.candidate.id));
  const selected = candidates[0]?.candidate;
  if (!selected || selected.id === current) return undefined;
  const familyFit = input.businessFamily && selected.metadata.compatibleFamilies.includes(input.businessFamily as never);
  const reasons = [
    `${selected.label} provides ${selected.patternIds.join(", ").replaceAll("_", " ")}.`,
    familyFit ? `Catalog metadata marks it compatible with ${input.businessFamily}.` : "It changes the visual pattern while preserving the section purpose.",
    nativeCompilerIds.has(selected.id) ? "A native component compiler is registered for this variant." : "The variant is an existing catalog capability.",
  ];
  return Object.freeze({ id: `visual-repair.${index}.${issue.id}.${section.id}`, issueId: issue.id, action: "replace_component_variant", sectionId: section.id, from: current, to: selected.id, instruction: `Replace ${current ?? "the current component"} with ${selected.id}.`, reason: Object.freeze(reasons), confidence: Math.min(.94, .72 + candidates[0].score * .025), automatic: false });
}

export const ComponentReplacementPlanner = Object.freeze({ plan: planComponentReplacement });
