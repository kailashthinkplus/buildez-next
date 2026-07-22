import { blueprintNodes, componentPattern, issue, numericStyle, type VisualCriticRule } from "../VisualCriticRule";

export const repeatedGridRule: VisualCriticRule = Object.freeze({
  id: "visual.layout.repeated-grids", category: "layout",
  evaluate(input) {
    const sections = input.compositionPlan?.orderedSectionSequence ?? [];
    const patterns = sections.map(componentPattern);
    const affected: string[] = [];
    for (let index = 2; index < sections.length; index += 1) if (patterns[index] === "grid" && patterns[index - 1] === "grid" && patterns[index - 2] === "grid") affected.push(sections[index - 2].id, sections[index - 1].id, sections[index].id);
    return affected.length ? [issue({ id: "issue.repeated-grids", category: "layout", severity: "medium", message: "Three consecutive card grids create visual fatigue.", recommendation: "Replace the middle grid with an editorial split or media-led section.", affectedSections: [...new Set(affected)], affectedNodeIds: [] }, "visual.layout.repeated-grids")] : [];
  },
});

export const whitespaceRule: VisualCriticRule = Object.freeze({
  id: "visual.layout.whitespace", category: "layout",
  evaluate(input) {
    const sections = blueprintNodes(input, "section");
    const compact = sections.filter((node) => Math.max(numericStyle(node.style.padding), numericStyle(node.style.paddingTop), numericStyle(node.style.paddingBottom)) < 56);
    return compact.length > Math.max(1, Math.floor(sections.length / 3)) ? [issue({ id: "issue.missing-whitespace", category: "layout", severity: "medium", message: "Too many sections lack sufficient visual breathing room.", recommendation: "Increase section spacing tokens and restore alternating open/dense rhythm.", affectedSections: [], affectedNodeIds: compact.map((node) => node.id) }, "visual.layout.whitespace")] : [];
  },
});

export const heroBalanceRule: VisualCriticRule = Object.freeze({
  id: "visual.layout.hero-balance", category: "layout",
  evaluate(input) {
    const hero = input.compositionPlan?.orderedSectionSequence?.find((section) => componentPattern(section) === "hero");
    if (!hero) return [];
    const heroNodes = blueprintNodes(input).filter((node) => node.id.endsWith(`.${hero.id}`));
    const headings = heroNodes.filter((node) => node.type === "heading").length;
    const actions = heroNodes.filter((node) => node.type === "button").length;
    return headings && actions ? [] : [issue({ id: "issue.unbalanced-hero", category: "layout", severity: "high", message: "Hero hierarchy is unbalanced or lacks a clear action.", recommendation: "Use a hero variant with explicit headline, supporting content, and primary CTA hierarchy.", affectedSections: [hero.id], affectedNodeIds: heroNodes.map((node) => node.id) }, "visual.layout.hero-balance")];
  },
});

export const sectionRhythmRule: VisualCriticRule = Object.freeze({
  id: "visual.layout.section-rhythm", category: "layout",
  evaluate(input) {
    const equalWeights = input.compositionPlan?.sectionWeights?.filter((item) => item.weight === "medium").length ?? 0;
    const total = input.compositionPlan?.sectionWeights?.length ?? 0;
    if (input.visualQualityScore.layout >= 85 && (!total || equalWeights / total < .85)) return [];
    return [issue({ id: "issue.weak-section-rhythm", category: "layout", severity: "medium", message: "Section rhythm is weak because too many sections carry equal visual weight.", recommendation: "Vary section weight and spacing metadata to create open, dense, and proof-led beats.", affectedSections: input.compositionPlan?.sectionWeights?.map((item) => item.sectionId) ?? [], affectedNodeIds: [] }, "visual.layout.section-rhythm")];
  },
});

export const layoutRules = Object.freeze([repeatedGridRule, whitespaceRule, heroBalanceRule, sectionRhythmRule]);
