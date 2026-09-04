import type { VisualCriticIssue, VisualRepairRecommendation } from "../VisualCriticResult";

export function planContentDensityRepair(issue: VisualCriticIssue, index: number): VisualRepairRecommendation | undefined {
  if (!['issue.heading-density', 'issue.long-paragraphs'].includes(issue.id)) return undefined;
  const sectionId = issue.affectedSections[0];
  return Object.freeze({ id: `visual-repair.${index}.${issue.id}.density`, issueId: issue.id, action: "reduce_content_density", sectionId, instruction: "Reduce supporting-copy density while preserving the section heading and primary meaning.", reason: Object.freeze(["Improves scanability and reading measure.", "Maintains semantic hierarchy without changing generated facts."]), confidence: issue.id === "issue.heading-density" ? .9 : .86, automatic: false });
}

export const ContentDensityPlanner = Object.freeze({ plan: planContentDensityRepair });
