import { resolveRenderStyle } from "../../core/rendering/renderStyleResolver";
import type { BuilderBlueprint } from "../../types/blueprint";

export type BenchmarkViewport = "desktop" | "tablet" | "mobile";
export type RenderContractCapture = Readonly<{
  viewport: BenchmarkViewport;
  width: number;
  nodes: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  canvasRuntimeParity: boolean;
  pixelScreenshotCertified: false;
}>;

const WIDTHS: Record<BenchmarkViewport, number> = { desktop: 1440, tablet: 768, mobile: 390 };

export function captureRenderContracts(blueprint: BuilderBlueprint): readonly RenderContractCapture[] {
  return (Object.keys(WIDTHS) as BenchmarkViewport[]).map((viewport) => {
    const canvas = Object.fromEntries(Object.values(blueprint.nodes).map((node) => [node.id, resolveRenderStyle(node, blueprint, { device: viewport, scale: 1, canvasWidth: WIDTHS[viewport] })]));
    const runtime = Object.fromEntries(Object.values(blueprint.nodes).map((node) => [node.id, resolveRenderStyle(node, blueprint, { device: viewport, scale: 1 })]));
    return Object.freeze({ viewport, width: WIDTHS[viewport], nodes: Object.freeze(runtime) as unknown as Readonly<Record<string, Readonly<Record<string, unknown>>>>,
      canvasRuntimeParity: JSON.stringify(canvas) === JSON.stringify(runtime), pixelScreenshotCertified: false as const });
  });
}
