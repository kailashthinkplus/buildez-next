import { blueprintNodes, componentPattern, issue, type VisualCriticRule } from "../VisualCriticRule";

export const mediaRule: VisualCriticRule = Object.freeze({
  id: "visual.media.storytelling", category: "media",
  evaluate(input) {
    const sections = input.compositionPlan?.orderedSectionSequence ?? [];
    const images = blueprintNodes(input, "image");
    const usableImages = images.filter((node) => String(node.props.src ?? "").trim());
    const hero = sections.find((section) => componentPattern(section) === "hero");
    const heroImages = hero ? usableImages.filter((node) => node.id.endsWith(`.${hero.id}`)) : [];
    const hasMediaSection = sections.some((section) => componentPattern(section) === "media");
    const issues = [];
    if (hero && !heroImages.length) issues.push(issue({ id: "issue.hero-media-missing", category: "media", severity: "low", message: "Hero is text-led and may lack a strong visual anchor.", recommendation: "Consider a media-led hero variant when the business has suitable trustworthy assets.", affectedSections: [hero.id], affectedNodeIds: [] }, "visual.media.storytelling"));
    if (!hasMediaSection && usableImages.length < 2) issues.push(issue({ id: "issue.visual-storytelling-insufficient", category: "media", severity: "medium", message: "The page provides insufficient visual storytelling between dense sections.", recommendation: "Add a gallery, showcase, or editorial media section using existing asset intent.", affectedSections: [], affectedNodeIds: images.map((node) => node.id) }, "visual.media.storytelling"));
    const sources = usableImages.map((node) => String(node.props.src ?? ""));
    const repeated = sources.filter((source, index) => sources.indexOf(source) !== index);
    if (repeated.length) issues.push(issue({ id: "issue.repeated-image-pattern", category: "media", severity: "medium", message: "Repeated image treatment weakens the page narrative.", recommendation: "Vary crop, subject, or media role while keeping the existing media strategy.", affectedSections: [], affectedNodeIds: images.filter((node) => repeated.includes(String(node.props.src ?? ""))).map((node) => node.id) }, "visual.media.storytelling"));
    return issues;
  },
});

export const mediaRules = Object.freeze([mediaRule]);
