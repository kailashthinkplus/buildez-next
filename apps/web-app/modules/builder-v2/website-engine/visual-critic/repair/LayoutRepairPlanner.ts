import { buildComponentCatalog } from "../../components/componentCatalog";
import { componentPattern, type VisualCriticInput } from "../VisualCriticRule";
import type { VisualCriticIssue, VisualRepairRecommendation } from "../VisualCriticResult";

const existingPatterns = new Set(buildComponentCatalog().flatMap((component) => component.patternIds));

export function planLayoutRepair(issue: VisualCriticIssue, input: VisualCriticInput, index: number): VisualRepairRecommendation | undefined {
  if (issue.id !== "issue.repeated-grids" && issue.id !== "issue.visual-storytelling-insufficient" && issue.id !== "issue.repeated-image-pattern") return undefined;
  const sections = input.compositionPlan?.orderedSectionSequence ?? [];
  const affected = sections.filter((section) => issue.affectedSections.includes(section.id));
  const middle = issue.id === "issue.repeated-grids" ? affected[Math.floor(affected.length / 2)] : affected[0];
  const options = issue.id === "issue.repeated-grids" ? ["editorial_split", "founder_story", "process_timeline", "project_showcase"] : ["lifestyle_gallery", "project_showcase"];
  const suggestedPattern = issue.id === "issue.repeated-grids" ? "editorial_split" : options.find((pattern) => existingPatterns.has(pattern)) ?? "project_showcase";
  return Object.freeze({ id: `visual-repair.${index}.${issue.id}.layout`, issueId: issue.id, action: "change_layout_pattern", sectionId: middle?.id, from: middle ? componentPattern(middle) : undefined, suggestedPattern, instruction: `Change ${middle?.id ?? "the affected section"} to the existing ${suggestedPattern.replaceAll("_", " ")} pattern.`, reason: Object.freeze(["Breaks consecutive equal-shape sections.", "Preserves the semantic journey and uses a catalogued layout capability."]), confidence: issue.id === "issue.repeated-grids" ? .88 : .8, automatic: false });
}

export const LayoutRepairPlanner = Object.freeze({ plan: planLayoutRepair });
