import { componentPattern, issue, sectionText, type VisualCriticRule } from "../VisualCriticRule";

export const conversionRule: VisualCriticRule = Object.freeze({
  id: "visual.conversion.cadence", category: "conversion",
  evaluate(input) {
    const sections = input.compositionPlan?.orderedSectionSequence ?? [];
    const conversionIndexes = sections.map((section, index) => componentPattern(section) === "conversion" ? index : -1).filter((index) => index >= 0);
    const trustIndex = sections.findIndex((section) => /trust|review|testimonial|proof|credential|case-study/.test(sectionText(section)));
    const issues = [];
    if (!conversionIndexes.length) issues.push(issue({ id: "issue.cta-missing", category: "conversion", severity: "high", message: "The page has no clear conversion section.", recommendation: "Add one decisive conversion block after the primary trust journey.", affectedSections: [], affectedNodeIds: [] }, "visual.conversion.cadence"));
    if (conversionIndexes.length > 2) issues.push(issue({ id: "issue.cta-overload", category: "conversion", severity: "high", message: "Too many primary CTA sections compete for attention.", recommendation: "Keep one contextual action and one final conversion close.", affectedSections: conversionIndexes.map((index) => sections[index].id), affectedNodeIds: [] }, "visual.conversion.cadence"));
    if (conversionIndexes[0] !== undefined && conversionIndexes[0] < 2) issues.push(issue({ id: "issue.cta-too-early", category: "conversion", severity: "medium", message: "Primary conversion is requested before the page establishes context.", recommendation: "Move the conversion block after value and trust evidence.", affectedSections: [sections[conversionIndexes[0]].id], affectedNodeIds: [] }, "visual.conversion.cadence"));
    if (conversionIndexes.length && (trustIndex < 0 || trustIndex > conversionIndexes[0])) issues.push(issue({ id: "issue.trust-before-conversion", category: "conversion", severity: "high", message: "Conversion appears before sufficient trust evidence.", recommendation: "Introduce credentials, proof, reviews, or outcomes before the primary conversion close.", affectedSections: [sections[conversionIndexes[0]].id], affectedNodeIds: [] }, "visual.conversion.cadence"));
    return issues;
  },
});

export const conversionRules = Object.freeze([conversionRule]);
