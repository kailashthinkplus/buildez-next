import type { BuilderNode } from "../../types/blueprint";
import type { BuilderBlueprint } from "../../types/blueprint";
import type { BuilderResponsiveDevice } from "../../core/responsive";
import { getResponsiveValue } from "../../core/responsive";
import { getThemeContainerMaxWidth } from "../../theme/containerDefaults";

/** Width mode never clears maxWidth, so boxed -> full -> boxed is lossless. */
export function getContainerWidthModeProps(
  node: Pick<BuilderNode, "props">,
  mode: "boxed" | "full"
): BuilderNode["props"] {
  return { ...node.props, container: mode };
}

export function getEffectiveContainerMaxWidth(
  node: Pick<BuilderNode, "props" | "style">,
  blueprint: BuilderBlueprint,
  device: BuilderResponsiveDevice
): unknown {
  return getResponsiveValue(
    node.props?.maxWidth ?? node.style?.maxWidth,
    device,
    getThemeContainerMaxWidth(blueprint)
  );
}
