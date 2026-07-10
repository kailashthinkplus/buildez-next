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
