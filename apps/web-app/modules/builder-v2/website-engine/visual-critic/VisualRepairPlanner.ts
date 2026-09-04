import { planComponentReplacement, planContentDensityRepair, planLayoutRepair } from "./repair";
import { sectionForNode, type VisualCriticInput } from "./VisualCriticRule";
import type { VisualCriticIssue, VisualRepairRecommendation } from "./VisualCriticResult";

function affectedSection(issue: VisualCriticIssue, input: VisualCriticInput) {
  const id = issue.id === "issue.repeated-grids" ? issue.affectedSections[Math.floor(issue.affectedSections.length / 2)] : issue.affectedSections[0];
  return input.compositionPlan?.orderedSectionSequence?.find((section) => section.id === id)
    ?? issue.affectedNodeIds.map((nodeId) => sectionForNode(input, nodeId)).find(Boolean);
}

function tokenRepair(issue: VisualCriticIssue, index: number): VisualRepairRecommendation | undefined {
  const base = { id: `visual-repair.${index}.${issue.id}.token`, issueId: issue.id, sectionId: issue.affectedSections[0], automatic: false as const };
  if (issue.id === "issue.missing-whitespace" || issue.id === "issue.weak-section-rhythm") return Object.freeze({ ...base, action: "increase_section_spacing" as const, token: "spacing.sectionY", delta: "+12%", instruction: "Increase the section spacing token by 12% for the diagnosed sections.", reason: Object.freeze(["Restores breathing room and alternating page rhythm."]), confidence: .91 });
  if (issue.id === "issue.weak-heading-hierarchy") return Object.freeze({ ...base, action: "increase_heading_scale" as const, token: "typography.h2", delta: "+1 scale step", instruction: "Increase the H2 scale one established token step.", reason: Object.freeze(["Restores visible separation between section and item headings."]), confidence: .92 });
  return undefined;
}

function fallbackRepair(issue: VisualCriticIssue, index: number): VisualRepairRecommendation {
  const base = { id: `visual-repair.${index}.${issue.id}`, issueId: issue.id, sectionId: issue.affectedSections[0], instruction: issue.recommendation, automatic: false as const, reason: Object.freeze([issue.designPrinciple ?? "Addresses the deterministic critic finding."]) };
  if (["issue.cta-missing", "issue.cta-overload", "issue.cta-too-early", "issue.trust-before-conversion"].includes(issue.id)) return Object.freeze({ ...base, action: "adjust_cta_cadence", confidence: .91 });
  if (issue.category === "media") return Object.freeze({ ...base, action: "add_media_slot", confidence: .78 });
  if (issue.category === "typography") return Object.freeze({ ...base, action: "adjust_typography_tokens", confidence: .88 });
  if (issue.category === "layout") return Object.freeze({ ...base, action: "adjust_spacing_tokens", confidence: .84 });
  return Object.freeze({ ...base, action: "adjust_responsive_intent", confidence: .9 });
}

export function planVisualRepairs(issues: readonly VisualCriticIssue[], input: VisualCriticInput): readonly VisualRepairRecommendation[] {
  return Object.freeze(issues.flatMap((finding, offset) => {
    const index = offset + 1;
    const section = affectedSection(finding, input);
    const repairs: (VisualRepairRecommendation | undefined)[] = [
      tokenRepair(finding, index),
      planContentDensityRepair(finding, index),
      planLayoutRepair(finding, input, index),
      section && (finding.id === "issue.unbalanced-hero" || finding.id === "issue.hero-media-missing" || finding.id === "issue.repeated-grids") ? planComponentReplacement(finding, section, input, index) : undefined,
    ];
    const planned = repairs.filter((repair): repair is VisualRepairRecommendation => Boolean(repair));
    return planned.length ? planned : [fallbackRepair(finding, index)];
  }));
}

export const VisualRepairPlanner = Object.freeze({ plan: planVisualRepairs });
