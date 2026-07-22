import { blueprintNodes, issue, numericStyle, type VisualCriticRule } from "../VisualCriticRule";

export const typographyRule: VisualCriticRule = Object.freeze({
  id: "visual.typography.hierarchy", category: "typography",
  evaluate(input) {
    const headings = blueprintNodes(input, "heading");
    const h1 = headings.filter((node) => node.props.level === "h1");
    const h2 = headings.filter((node) => node.props.level === "h2");
    const issues = [];
    if (h1.length !== 1 || !h2.length) issues.push(issue({ id: "issue.weak-heading-hierarchy", category: "typography", severity: "high", message: "Heading hierarchy does not provide one clear page title and section-level emphasis.", recommendation: "Restore one H1 and use H2 headings for major section transitions.", affectedSections: [], affectedNodeIds: headings.map((node) => node.id) }, "visual.typography.hierarchy"));
    const denseSections = new Map<string, number>();
    for (const node of headings) {
      const section = node.id.split(".").at(-1) ?? "unknown";
      denseSections.set(section, (denseSections.get(section) ?? 0) + 1);
    }
    const dense = [...denseSections.entries()].filter(([, count]) => count > 7).map(([section]) => section);
    if (dense.length) issues.push(issue({ id: "issue.heading-density", category: "typography", severity: "medium", message: "Heading density is too high within one or more sections.", recommendation: "Demote supporting labels to body or eyebrow roles and keep headings for meaningful hierarchy.", affectedSections: dense, affectedNodeIds: [] }, "visual.typography.hierarchy"));
    return issues;
  },
});

export const paragraphRule: VisualCriticRule = Object.freeze({
  id: "visual.typography.paragraph-density", category: "typography",
  evaluate(input) {
    const text = blueprintNodes(input, "text");
    const long = text.filter((node) => String(node.props.text ?? "").split(/\s+/).length > 90 || (!/eyebrow|microcopy|caption|label|caution|reassurance|scope/i.test(node.name) && numericStyle(node.style.fontSize, "mobile") > 0 && numericStyle(node.style.fontSize, "mobile") < 14));
    return long.length ? [issue({ id: "issue.long-paragraphs", category: "typography", severity: "medium", message: "Long or undersized body copy reduces readability.", recommendation: "Shorten paragraphs, narrow text measure, and preserve readable mobile body sizing.", affectedSections: [], affectedNodeIds: long.map((node) => node.id) }, "visual.typography.paragraph-density")] : [];
  },
});

export const typographyRules = Object.freeze([typographyRule, paragraphRule]);
