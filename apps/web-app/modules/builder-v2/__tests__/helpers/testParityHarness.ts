import type { BuilderBlueprint, BuilderNode, NodeType } from "../../types/blueprint";
import {
  buildRenderContractSnapshot,
  resolveRenderStyle,
  resolveRenderThemeToken,
  validateRenderParity,
  isNativeRenderWidget,
  type RenderNodeContractSummary,
} from "../../core/rendering";
import type { BuilderResponsiveDevice } from "../../core/responsive";

export type RenderContractNode = RenderNodeContractSummary;

export function createCanvasRuntimeContractForSpec(
  blueprint: BuilderBlueprint,
  device: BuilderResponsiveDevice = "desktop"
): RenderContractNode[] {
  return buildRenderContractSnapshot(blueprint, device);
}

export function compareRenderContractsForSpec(
  left: RenderContractNode[],
  right: RenderContractNode[]
): boolean {
  return validateRenderParity(left, right).valid;
}

export function resolveCanvasStyleForSpec(
  node: BuilderNode,
  blueprint: BuilderBlueprint,
  device: BuilderResponsiveDevice = "desktop"
) {
  return resolveRenderStyle(node, blueprint, { device, scale: 1 });
}

export function resolveRuntimeStyleForSpec(
  node: BuilderNode,
  blueprint: BuilderBlueprint,
  device: BuilderResponsiveDevice = "desktop"
) {
  return resolveRenderStyle(node, blueprint, { device, scale: 1 });
}

export function resolveThemeTokenForSpec(
  value: unknown,
  blueprint: BuilderBlueprint
) {
  return resolveRenderThemeToken(value, blueprint);
}

export function widgetHasNativeParityContractForSpec(type: NodeType): boolean {
  return isNativeRenderWidget(type);
}

export function missingAssetFallsBackForSpec(node: BuilderNode): boolean {
  if (node.type !== "image" && node.type !== "video") return true;
  return typeof node.props?.src !== "string" || node.props.src.trim() === "";
}

export function hasBuilderOnlyOverlayLeakForSpec(contract: RenderContractNode): boolean {
  return contract.styleKeys.some((key) =>
    key.startsWith("builder") ||
    key.includes("Overlay") ||
    key.includes("selection") ||
    key.includes("hover")
  );
}
