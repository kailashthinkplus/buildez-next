import type { BuilderBlueprint, BuilderNode } from "../../types/blueprint";
import type { DesignExecutionPlan } from "../design-intelligence";
import type { VisualQualityScore } from "../visual-quality";
import type { VisualCriticIssue } from "./VisualCriticResult";

export type VisualCriticSection = Readonly<{
  id: string;
  componentId?: string;
  componentVariantId?: string;
  category?: string;
  purpose?: string;
}>;

export type VisualCriticCompositionPlan = Readonly<{
  orderedSectionSequence?: readonly VisualCriticSection[];
  sectionWeights?: readonly Readonly<{ sectionId: string; weight: "light" | "medium" | "heavy" }>[];
  mobileStacking?: Readonly<{ order?: readonly string[] }>;
  trustPlacement?: Readonly<{ beforePrimaryCta?: boolean; trustSectionIds?: readonly string[] }>;
}>;

export type VisualCriticInput = Readonly<{
  blueprint: BuilderBlueprint;
  compositionPlan?: VisualCriticCompositionPlan;
  designExecutionPlan?: DesignExecutionPlan;
  visualQualityScore: VisualQualityScore;
  businessFamily?: string;
  archetype?: string;
}>;

export type VisualCriticRule = Readonly<{
  id: string;
  category: VisualCriticIssue["category"];
  evaluate(input: VisualCriticInput): readonly VisualCriticIssue[];
}>;

export function issue(value: Omit<VisualCriticIssue, "ruleId">, ruleId: string): VisualCriticIssue {
  return Object.freeze({ ...value, ruleId, affectedSections: Object.freeze([...(value.affectedSections ?? [])]), affectedNodeIds: Object.freeze([...(value.affectedNodeIds ?? [])]) });
}

export function sectionText(section: VisualCriticSection): string {
  return `${section.componentVariantId ?? section.componentId ?? ""} ${section.category ?? ""} ${section.purpose ?? ""}`.toLowerCase();
}

export function sectionComponentId(section?: VisualCriticSection): string | undefined {
  return section?.componentVariantId ?? section?.componentId;
}

export function sectionForNode(input: VisualCriticInput, nodeId: string): VisualCriticSection | undefined {
  return input.compositionPlan?.orderedSectionSequence?.find((section) => nodeId === section.id || nodeId.endsWith(`.${section.id}`));
}

export function componentPattern(section: VisualCriticSection): "hero" | "grid" | "media" | "editorial" | "conversion" | "timeline" {
  const value = sectionText(section);
  if (/hero/.test(value)) return "hero";
  if (/gallery|showcase|portfolio|media/.test(value)) return "media";
  if (/cta|contact|booking|appointment|reservation|conversion/.test(value)) return "conversion";
  if (/timeline|process|steps/.test(value)) return "timeline";
  if (/card|matrix|grid|pricing|catalogue|menu|feature|service/.test(value)) return "grid";
  return "editorial";
}

export function blueprintNodes(input: VisualCriticInput, type?: BuilderNode["type"]): BuilderNode[] {
  const nodes = Object.values(input.blueprint.nodes);
  return type ? nodes.filter((node) => node.type === type) : nodes;
}

export function numericStyle(value: unknown, breakpoint: "desktop" | "tablet" | "mobile" = "desktop"): number {
  const resolved = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)[breakpoint] ?? (value as Record<string, unknown>).desktop ?? Object.values(value as Record<string, unknown>)[0]
    : value;
  return typeof resolved === "number" ? resolved : Number.parseFloat(String(resolved ?? "")) || 0;
}
