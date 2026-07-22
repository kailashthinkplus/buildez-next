import type { BuilderBlueprint, BuilderNode } from "../../types/blueprint";
import type { VisualQualityScore, VisualQualityWarning } from "./VisualQualityScore";
import { VISUAL_QUALITY_RULES, clampVisualScore } from "./visualRules";

export type VisualQualityInput = Readonly<{
  blueprint: BuilderBlueprint;
  selectedComponents?: readonly string[];
  compositionWarnings?: readonly string[];
}>;

function responsiveValue(value: unknown, breakpoint: "desktop" | "tablet" | "mobile" = "desktop"): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const record = value as Record<string, unknown>;
  return record[breakpoint] ?? record.desktop ?? Object.values(record)[0];
}

function numeric(value: unknown): number {
  const resolved = responsiveValue(value);
  return typeof resolved === "number" ? resolved : Number.parseFloat(String(resolved ?? "")) || 0;
}

function pattern(component: string): string {
  const value = component.toLowerCase();
  if (/hero/.test(value)) return "hero";
  if (/gallery|showcase|portfolio/.test(value)) return "media";
  if (/timeline|process/.test(value)) return "timeline";
  if (/cta|contact|booking|appointment|reservation/.test(value)) return "conversion";
  if (/card|matrix|grid|pricing|catalogue|menu|feature/.test(value)) return "cards";
  return "editorial";
}

function warning(code: string, message: string, nodes: readonly BuilderNode[] = []): VisualQualityWarning {
  return Object.freeze({ code, message, nodeIds: Object.freeze(nodes.map((node) => node.id)) });
}

export function evaluateVisualQuality(input: VisualQualityInput): VisualQualityScore {
  const nodes = Object.values(input.blueprint.nodes);
  const sections = nodes.filter((node) => node.type === "section");
  const headings = nodes.filter((node) => node.type === "heading");
  const textNodes = nodes.filter((node) => node.type === "text");
  const images = nodes.filter((node) => node.type === "image");
  const buttons = nodes.filter((node) => node.type === "button");
  const warnings: VisualQualityWarning[] = [];

  const unsafeOverflow = nodes.filter((node) => {
    const width = numeric(node.style?.width);
    const minWidth = numeric(node.style?.minWidth);
    return width > 1440 || minWidth > 390 || node.style?.overflowX === "scroll";
  });
  const sectionSpacing = sections.map((node) => Math.max(numeric(node.style?.paddingTop), numeric(node.style?.paddingBottom), numeric(node.style?.padding))).filter(Boolean);
  const spacingInRange = sectionSpacing.filter((value) => value >= VISUAL_QUALITY_RULES.minimumSectionSpacing && value <= VISUAL_QUALITY_RULES.maximumSectionSpacing).length;
  if (unsafeOverflow.length) warnings.push(warning("overflow-risk", "Fixed widths or horizontal scrolling may escape the viewport.", unsafeOverflow));
  if (sections.length && spacingInRange < Math.ceil(sections.length * 0.7)) warnings.push(warning("section-rhythm", "Section spacing lacks a consistent professional rhythm.", sections));
  const layout = clampVisualScore(100 - unsafeOverflow.length * 12 - Math.max(0, sections.length - spacingInRange) * 3);

  const h1 = headings.filter((node) => node.props.level === "h1");
  const h2 = headings.filter((node) => node.props.level === "h2");
  const undersizedText = textNodes.filter((node) => !/eyebrow|microcopy|caption|label/i.test(node.name) && numeric(node.style?.fontSize) > 0 && numeric(node.style?.fontSize) < VISUAL_QUALITY_RULES.minimumBodyFontSize);
  if (h1.length !== 1) warnings.push(warning("heading-h1-count", "A professional page requires exactly one primary H1.", h1));
  if (!h2.length && sections.length > 1) warnings.push(warning("heading-section-level", "Section-level H2 hierarchy is missing.", headings));
  if (undersizedText.length) warnings.push(warning("text-readability", "Body text falls below the 16px readability target.", undersizedText));
  const typography = clampVisualScore(100 - Math.abs(1 - h1.length) * 24 - (h2.length ? 0 : 12) - undersizedText.length * 3);

  const patterns = (input.selectedComponents ?? []).map(pattern);
  let consecutiveCards = 0;
  let maximumCards = 0;
  for (const item of patterns) {
    consecutiveCards = item === "cards" ? consecutiveCards + 1 : 0;
    maximumCards = Math.max(maximumCards, consecutiveCards);
  }
  const patternDiversity = new Set(patterns).size;
  if (maximumCards > VISUAL_QUALITY_RULES.maximumConsecutiveCardComponents) warnings.push(warning("card-fatigue", "Too many consecutive card-driven components reduce visual hierarchy."));
  if (patterns.length >= 5 && patternDiversity < VISUAL_QUALITY_RULES.minimumComponentPatterns) warnings.push(warning("component-repetition", "The page needs more layout-pattern diversity."));
  const hierarchy = clampVisualScore(100 - Math.max(0, maximumCards - 2) * 15 - Math.max(0, VISUAL_QUALITY_RULES.minimumComponentPatterns - patternDiversity) * 8 - (buttons.length ? 0 : 10));

  const incompleteImages = images.filter((node) => !String(node.props.src ?? "").trim() || !String(node.props.alt ?? "").trim());
  if (incompleteImages.length) warnings.push(warning("imagery-incomplete", "Image sources and accessible alt text must be present for visual evaluation.", incompleteImages));
  const imagery = clampVisualScore(images.length ? 100 - incompleteImages.length * 18 : patterns.includes("media") ? 55 : 88);

  const responsiveNodes = nodes.filter((node) => Object.values(node.style ?? {}).some((value) => value && typeof value === "object" && !Array.isArray(value)));
  const mobileUnsafeImages = images.filter((node) => numeric(node.style?.width) > 100 && String(responsiveValue(node.style?.width, "mobile")).includes("px"));
  if (!responsiveNodes.length) warnings.push(warning("responsive-metadata", "No responsive style bindings were detected."));
  if (mobileUnsafeImages.length) warnings.push(warning("mobile-image-width", "Image behavior may exceed the mobile viewport.", mobileUnsafeImages));
  const responsive = clampVisualScore(100 - (responsiveNodes.length ? 0 : 30) - mobileUnsafeImages.length * 15 - (buttons.length ? 0 : 8));

  for (const code of input.compositionWarnings ?? []) if (!warnings.some((item) => item.code === code)) warnings.push(warning(`composition-${code}`, `Composition quality reported ${code}.`));
  const overall = clampVisualScore((layout + typography + hierarchy + imagery + responsive) / 5);
  return Object.freeze({ layout, typography, hierarchy, imagery, responsive, overall, warnings: Object.freeze(warnings) });
}

export const VisualQualityEvaluator = Object.freeze({ evaluate: evaluateVisualQuality });
