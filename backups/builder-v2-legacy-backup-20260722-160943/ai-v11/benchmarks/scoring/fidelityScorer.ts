import type { BlueprintCompilation } from "../../compiler/blueprintCompiler";
import type { DesignGraph } from "../../design-graph/schema";
import type { RenderContractCapture } from "../renderHarness";

export type FidelityCategory = "structure" | "layout" | "responsiveComposition" | "typography" | "colorsBackgrounds" | "effects" | "content" | "mediaRoles" | "editability" | "rendererParity";
export type FidelityReport = Readonly<{
  categories: Readonly<Record<FidelityCategory, number>>;
  criticalFailures: readonly string[];
  passed: boolean;
  nonCompensating: true;
}>;

function clamp(value: number) { return Math.max(0, Math.min(100, Math.round(value))); }

export function scoreFidelity(graph: DesignGraph, compilation: BlueprintCompilation, captures: readonly RenderContractCapture[]): FidelityReport {
  const graphNodes = Object.values(graph.nodes), blueprintNodes = Object.values(compilation.blueprint.nodes);
  const warningCount = compilation.diagnostics.filter((item) => item.severity === "warning").length;
  const errorCount = compilation.diagnostics.filter((item) => item.severity === "error").length;
  const effectCount = graphNodes.reduce((sum, node) => sum + node.effects.length, 0);
  const loweredEffects = blueprintNodes.reduce((sum, node) => sum + (((node.props.advanced as any)?.designLayerReasons as unknown[] | undefined)?.length ?? 0), 0);
  const media = graphNodes.filter((node) => node.media), compiledMedia = blueprintNodes.filter((node) => node.props.mediaRole);
  const headings = graphNodes.filter((node) => node.type === "heading"), compiledHeadings = blueprintNodes.filter((node) => node.type === "heading");
  const categories: Record<FidelityCategory, number> = {
    structure: clamp(100 - Math.abs(graphNodes.length - blueprintNodes.length) * 10),
    layout: clamp(100 - compilation.diagnostics.filter((item) => /LAYOUT|GRID|OVERLAP/.test(item.code)).length * 15),
    responsiveComposition: clamp(100 - compilation.diagnostics.filter((item) => /RESPONSIVE/.test(item.code)).length * 20),
    typography: clamp(100 - Math.abs(headings.length - compiledHeadings.length) * 25),
    colorsBackgrounds: clamp(100 - compilation.diagnostics.filter((item) => /COLOR|BACKGROUND|GRADIENT/.test(item.code)).length * 15),
    effects: effectCount ? clamp((loweredEffects / effectCount) * 100 - errorCount * 20) : 100,
    content: clamp(100 - compilation.diagnostics.filter((item) => /VISIBLE|CONTENT|EXPRESSION/.test(item.code)).length * 20),
    mediaRoles: media.length ? clamp((compiledMedia.length / media.length) * 100) : 100,
    editability: clamp(100 - blueprintNodes.filter((node) => !["page", "section", "container", "heading", "text", "button", "image"].includes(node.type)).length * 20),
    rendererParity: captures.every((capture) => capture.canvasRuntimeParity) ? 100 : 0,
  };
  const criticalFailures: string[] = [];
  if (graphNodes.filter((node) => node.type === "section").length !== blueprintNodes.filter((node) => node.type === "section").length) criticalFailures.push("lost-section");
  if (!blueprintNodes.some((node) => node.type === "heading" && node.props.level === "h1")) criticalFailures.push("lost-primary-heading");
  if (!blueprintNodes.some((node) => node.type === "button")) criticalFailures.push("lost-cta");
  if (!graphNodes.some((node) => node.media?.role === "hero-background" || node.media?.role === "hero-foreground")) criticalFailures.push("missing-hero-media-role");
  if (compilation.diagnostics.some((item) => item.code.startsWith("UNSAFE_CSS"))) criticalFailures.push("unsafe-css");
  if (errorCount) criticalFailures.push("unresolved-visible-source-construct");
  if (!captures.every((capture) => capture.canvasRuntimeParity)) criticalFailures.push("canvas-runtime-mismatch");
  const passed = criticalFailures.length === 0 && Object.values(categories).every((score) => score >= 80);
  return Object.freeze({ categories: Object.freeze(categories), criticalFailures: Object.freeze(criticalFailures), passed, nonCompensating: true as const });
}
