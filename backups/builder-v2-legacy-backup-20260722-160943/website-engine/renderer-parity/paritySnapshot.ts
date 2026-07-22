import type { BuilderBlueprint, BuilderNode, NodeType } from "../../types/blueprint";
import type { NativeBuilderMappingPlan } from "../mapper";
import { RENDERER_PARITY_SUPPORTED_WIDGET_TYPES } from "./parityRules";
import type { RenderTarget, RenderTargetDescriptor } from "./renderTargets";

export type RendererParitySnapshot = Readonly<{
  id: string;
  target: RenderTarget;
  blueprintTitle?: string;
  mappingPlanId?: string;
  nodeCount: number;
  widgetTypes: readonly NodeType[];
  unsupportedWidgetTypes: readonly NodeType[];
  hasResponsiveMetadata: boolean;
  hasStyleBindings: boolean;
  missingAssetCount: number;
  requiredAssetCount: number;
  hasMotionMetadata: boolean;
  mapperCompatible: boolean;
  screenshotCaptured: false;
  rendered: false;
}>;

function getNodes(input: { blueprint?: BuilderBlueprint; mappingPlan?: NativeBuilderMappingPlan }): BuilderNode[] {
  if (input.mappingPlan) return input.mappingPlan.nodeCreationPlan.map((node) => node.nativeNode);
  return input.blueprint ? Object.values(input.blueprint.nodes) : [];
}

function hasMotionMetadata(nodes: BuilderNode[]): boolean {
  return nodes.some((node) => {
    const advanced = node.props?.advanced;
    if (!advanced || typeof advanced !== "object") return false;
    const motion = (advanced as Record<string, unknown>).motion;
    return !!motion && typeof motion === "object";
  });
}

/**
 * Builds an inert parity snapshot for one render target. No rendering or screenshots occur.
 *
 * @example
 * const snapshot = buildParitySnapshot({ target, mappingPlan });
 */
export function buildParitySnapshot(input: {
  target: RenderTargetDescriptor;
  blueprint?: BuilderBlueprint;
  mappingPlan?: NativeBuilderMappingPlan;
}): RendererParitySnapshot {
  const nodes = getNodes(input);
  const widgetTypes = [...new Set(nodes.map((node) => node.type))];
  const supportedTypes = new Set<NodeType>(RENDERER_PARITY_SUPPORTED_WIDGET_TYPES);
  const unsupportedWidgetTypes = widgetTypes.filter((type) => !supportedTypes.has(type));
  return Object.freeze({
    id: `parity-snapshot.${input.target.id}`,
    target: input.target.id,
    blueprintTitle: input.blueprint?.metadata.title,
    mappingPlanId: input.mappingPlan?.id,
    nodeCount: nodes.length,
    widgetTypes,
    unsupportedWidgetTypes,
    hasResponsiveMetadata: Boolean(input.mappingPlan?.responsivePlan.length),
    hasStyleBindings: Boolean(input.mappingPlan?.stylePlan.length),
    missingAssetCount: input.mappingPlan?.assetPlan.filter((asset) => asset.missing).length ?? 0,
    requiredAssetCount: input.mappingPlan?.assetPlan.filter((asset) => asset.required).length ?? 0,
    hasMotionMetadata: hasMotionMetadata(nodes),
    mapperCompatible: input.mappingPlan ? input.mappingPlan.validation.valid : Boolean(input.blueprint),
    screenshotCaptured: false as const,
    rendered: false as const,
  });
}

/**
 * Compares inert parity snapshots and returns metadata-level mismatch codes.
 *
 * @example
 * const mismatches = compareParitySnapshots(snapshots);
 */
export function compareParitySnapshots(snapshots: RendererParitySnapshot[]): string[] {
  if (!snapshots.length) return ["NO_SNAPSHOTS"];
  const baseline = snapshots[0];
  const mismatches: string[] = [];
  for (const snapshot of snapshots.slice(1)) {
    if (snapshot.nodeCount !== baseline.nodeCount) mismatches.push(`${snapshot.target}:NODE_COUNT_MISMATCH`);
    if (snapshot.widgetTypes.join("|") !== baseline.widgetTypes.join("|")) mismatches.push(`${snapshot.target}:WIDGET_TYPE_MISMATCH`);
    if (snapshot.unsupportedWidgetTypes.length) mismatches.push(`${snapshot.target}:UNSUPPORTED_WIDGET_TYPE`);
    if (snapshot.hasResponsiveMetadata !== baseline.hasResponsiveMetadata) mismatches.push(`${snapshot.target}:RESPONSIVE_METADATA_MISMATCH`);
    if (snapshot.hasStyleBindings !== baseline.hasStyleBindings) mismatches.push(`${snapshot.target}:STYLE_BINDING_MISMATCH`);
    if (snapshot.missingAssetCount !== baseline.missingAssetCount) mismatches.push(`${snapshot.target}:ASSET_MISSING_COUNT_MISMATCH`);
  }
  return mismatches;
}
