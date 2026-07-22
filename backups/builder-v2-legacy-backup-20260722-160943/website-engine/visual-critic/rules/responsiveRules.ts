import { blueprintNodes, issue, numericStyle, type VisualCriticRule } from "../VisualCriticRule";

export const responsiveRule: VisualCriticRule = Object.freeze({
  id: "visual.responsive.safety", category: "responsive",
  evaluate(input) {
    const nodes = blueprintNodes(input);
    const unsafe = nodes.filter((node) => numericStyle(node.style.minWidth, "mobile") > 390 || numericStyle(node.style.width, "mobile") > 600 || node.style.overflowX === "scroll");
    const buttons = blueprintNodes(input, "button");
    const hiddenCtas = buttons.filter((node) => node.style.display && typeof node.style.display === "object" && (node.style.display as Record<string, unknown>).mobile === "none");
    const stackOrder = input.compositionPlan?.mobileStacking?.order ?? [];
    const sectionIds = input.compositionPlan?.orderedSectionSequence?.map((section) => section.id) ?? [];
    const poorStack = sectionIds.length > 1 && (stackOrder.length !== sectionIds.length || sectionIds.some((id) => !stackOrder.includes(id)));
    const issues = [];
    if (unsafe.length || input.visualQualityScore.responsive < 75) issues.push(issue({ id: "issue.mobile-overflow", category: "responsive", severity: "high", message: "Mobile layout contains overflow risk.", recommendation: "Reduce fixed width intent and enforce single-column mobile containment.", affectedSections: [], affectedNodeIds: unsafe.map((node) => node.id) }, "visual.responsive.safety"));
    if (poorStack) issues.push(issue({ id: "issue.poor-mobile-stacking", category: "responsive", severity: "medium", message: "Mobile stacking metadata does not preserve the complete section journey.", recommendation: "Restore headline, CTA, media, and supporting-content order for mobile.", affectedSections: sectionIds, affectedNodeIds: [] }, "visual.responsive.safety"));
    if (hiddenCtas.length || !buttons.length) issues.push(issue({ id: "issue.mobile-cta-hidden", category: "responsive", severity: "high", message: "The primary CTA is unavailable on mobile.", recommendation: "Keep at least one editable primary CTA visible at the mobile breakpoint.", affectedSections: [], affectedNodeIds: hiddenCtas.map((node) => node.id) }, "visual.responsive.safety"));
    return issues;
  },
});

export const responsiveRules = Object.freeze([responsiveRule]);
