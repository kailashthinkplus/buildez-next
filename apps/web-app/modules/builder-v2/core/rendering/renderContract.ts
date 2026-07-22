import type { BuilderBlueprint, BuilderNode, NodeType } from "../../types/blueprint";
import type { BuilderResponsiveDevice } from "../responsive";

export type BuilderRenderSurface = "canvas" | "runtime" | "preview" | "publish";

export type BuilderRenderContract = Readonly<{
  surface: BuilderRenderSurface;
  device: BuilderResponsiveDevice;
  node: BuilderNode;
  blueprint: BuilderBlueprint;
}>;

export type RenderNodeContractSummary = Readonly<{
  id: string;
  type: NodeType;
  childCount: number;
  hidden: boolean;
  styleKeys: string[];
  responsiveVisibilityKeys: string[];
  supported: boolean;
}>;

export type NativeLayoutDisplay = "block" | "flex" | "grid" | "inline-block" | "none";

const NATIVE_LAYOUT_DISPLAYS = new Set<NativeLayoutDisplay>([
  "block",
  "flex",
  "grid",
  "inline-block",
  "none",
]);

function supportedDisplay(value: unknown): NativeLayoutDisplay | undefined {
  return typeof value === "string" && NATIVE_LAYOUT_DISPLAYS.has(value as NativeLayoutDisplay)
    ? value as NativeLayoutDisplay
    : undefined;
}

/**
 * Resolves the native container display contract shared by Canvas and runtime.
 * Canonical resolved style is authoritative. The legacy layout prop is a
 * fallback only, and a flex default is used only when neither is specified.
 */
export function resolveNativeLayoutDisplay(input: Readonly<{
  resolvedDisplay?: unknown;
  layoutProp?: unknown;
  defaultDisplay?: NativeLayoutDisplay;
}>): NativeLayoutDisplay {
  return supportedDisplay(input.resolvedDisplay)
    ?? supportedDisplay(input.layoutProp)
    ?? input.defaultDisplay
    ?? "flex";
}

export function createRenderContractSummary(
  node: BuilderNode
): RenderNodeContractSummary {
  const visibility = node.props.__responsiveVisibility;
  const responsiveVisibilityKeys =
    visibility && typeof visibility === "object" && !Array.isArray(visibility)
      ? Object.keys(visibility).sort()
      : [];

  return Object.freeze({
    id: node.id,
    type: node.type,
    childCount: node.children.length,
    hidden: Boolean(node.hidden),
    styleKeys: Object.keys(node.style ?? {}).sort(),
    responsiveVisibilityKeys,
    supported: true,
  });
}
