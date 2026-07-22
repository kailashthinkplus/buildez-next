import { VISUAL_CRITIC_RULES } from "./rules";
import type { VisualCriticInput } from "./VisualCriticRule";
import { sectionComponentId, sectionForNode } from "./VisualCriticRule";
import type { AffectedSectionDiagnosis, VisualCriticIssue, VisualCriticResult, VisualCriticSeverity } from "./VisualCriticResult";
import { planVisualRepairs } from "./VisualRepairPlanner";

const penalty: Record<VisualCriticSeverity, number> = { low: 2, medium: 7, high: 13, critical: 22 };
const rank: Record<VisualCriticSeverity, number> = { low: 1, medium: 2, high: 3, critical: 4 };

const diagnosis: Record<string, Readonly<{ violation: string; principle: string; confidence: number }>> = {
  "issue.repeated-grids": { violation: "repeated-layout-fatigue", principle: "Adjacent sections should vary visual pattern and information rhythm.", confidence: .94 },
  "issue.missing-whitespace": { violation: "compressed-section-spacing", principle: "Section spacing must create readable visual breathing room.", confidence: .88 },
  "issue.unbalanced-hero": { violation: "weak-media-balance", principle: "The hero must establish a dominant headline, supporting content, and action hierarchy.", confidence: .92 },
  "issue.weak-section-rhythm": { violation: "equal-section-weight", principle: "A page should alternate emphasis, density, and proof beats.", confidence: .87 },
  "issue.weak-heading-hierarchy": { violation: "flat-heading-scale", principle: "Heading levels must expose the page and section hierarchy.", confidence: .96 },
  "issue.heading-density": { violation: "excessive-heading-density", principle: "Headings should mark meaningful transitions rather than supporting labels.", confidence: .9 },
  "issue.long-paragraphs": { violation: "excessive-content-density", principle: "Body copy must remain scannable at a readable measure.", confidence: .88 },
  "issue.cta-overload": { violation: "competing-conversion-actions", principle: "Conversion actions require a clear primary cadence.", confidence: .95 },
  "issue.cta-missing": { violation: "missing-conversion-path", principle: "The page journey must end in a clear next step.", confidence: .97 },
  "issue.cta-too-early": { violation: "premature-conversion-request", principle: "Value and context should precede a primary conversion request.", confidence: .91 },
  "issue.trust-before-conversion": { violation: "missing-trust-sequence", principle: "Trust evidence should precede high-intent conversion.", confidence: .95 },
  "issue.hero-media-missing": { violation: "weak-media-balance", principle: "Media-led positioning should have a trustworthy visual anchor.", confidence: .82 },
  "issue.visual-storytelling-insufficient": { violation: "insufficient-media-narrative", principle: "Visual evidence should break up dense information sequences.", confidence: .84 },
  "issue.repeated-image-pattern": { violation: "repeated-media-treatment", principle: "Media roles and treatments should advance the narrative.", confidence: .9 },
  "issue.mobile-overflow": { violation: "mobile-containment-risk", principle: "Content must remain inside the mobile viewport.", confidence: .97 },
  "issue.poor-mobile-stacking": { violation: "incomplete-mobile-journey", principle: "Mobile stacking must preserve the complete semantic journey.", confidence: .93 },
  "issue.mobile-cta-hidden": { violation: "hidden-mobile-conversion", principle: "At least one primary action must remain reachable on mobile.", confidence: .98 },
};

function diagnoseSections(issues: readonly VisualCriticIssue[], input: VisualCriticInput): readonly AffectedSectionDiagnosis[] {
  const sections = input.compositionPlan?.orderedSectionSequence ?? [];
  return Object.freeze(issues.flatMap((finding) => {
    const details = diagnosis[finding.id] ?? { violation: finding.violation ?? "visual-quality-violation", principle: finding.designPrinciple ?? "Preserve clear visual hierarchy.", confidence: .75 };
    const explicit = finding.affectedSections.map((id) => sections.find((section) => section.id === id)).filter(Boolean);
    const fromNodes = finding.affectedNodeIds.map((id) => sectionForNode(input, id)).filter(Boolean);
    const targets = [...new Map([...explicit, ...fromNodes].map((section) => [section!.id, section!])).values()];
    return targets.map((section) => Object.freeze({ sectionId: section.id, componentVariantId: sectionComponentId(section), issue: finding.message, severity: finding.severity, confidence: details.confidence, violation: finding.violation ?? details.violation, designPrinciple: finding.designPrinciple ?? details.principle }));
  }));
}

export function runVisualCritic(input: VisualCriticInput): VisualCriticResult {
  const issues = Object.freeze(VISUAL_CRITIC_RULES.flatMap((rule) => rule.evaluate(input)));
  const score = Math.max(0, Math.min(100, Math.round(input.visualQualityScore.overall - issues.reduce((total, finding) => total + penalty[finding.severity], 0))));
  const highest = issues.reduce<VisualCriticSeverity | undefined>((current, finding) => !current || rank[finding.severity] > rank[current] ? finding.severity : current, undefined);
  const repairPriority = highest ?? "none";
  const affectedSections = diagnoseSections(issues, input);
  const recommendations = planVisualRepairs(issues, input);
  const repairPlan = Object.freeze({ recommendations, affectedSections, repairPriority, deterministic: true as const, recommendationOnly: true as const, blueprintMutated: false as const });
  return Object.freeze({ score, issues, recommendations, affectedSections, repairPlan, repairPriority, metadataOnly: true, blueprintMutated: false });
}

export const VisualCriticEngine = Object.freeze({ evaluate: runVisualCritic });
