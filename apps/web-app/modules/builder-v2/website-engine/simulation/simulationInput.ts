import type { BuilderBlueprintResult } from "../builder-blueprint";
import type { ComponentResult } from "../components";
import type { CompositionResult } from "../composition";
import type { CompiledWebsitePlan } from "../compiler";
import type { DesignResult } from "../design";
import type { MediaStrategy } from "../media-intelligence";
import type { MotionStrategy } from "../motion-intelligence";
import type { NativeBuilderMappingPlan } from "../mapper";
import type { RendererParityResult } from "../renderer-parity";
import type { MissingFact, WebsiteDNA, WebsiteSpec } from "../sdk";

export type SimulationInput = Readonly<{
  websiteSpec?: WebsiteSpec;
  websiteDNA?: WebsiteDNA;
  compiledPlan?: CompiledWebsitePlan;
  builderBlueprintResult?: BuilderBlueprintResult;
  mappingPlan?: NativeBuilderMappingPlan;
  rendererParityResult?: RendererParityResult;
  mediaStrategy?: MediaStrategy;
  motionStrategy?: MotionStrategy;
  designResult?: DesignResult;
  componentResult?: ComponentResult;
  compositionResult?: CompositionResult;
  knownAssets?: readonly string[];
  missingFacts?: readonly MissingFact[];
  missingAssets?: readonly string[];
  featureFlags?: Readonly<Record<string, boolean>>;
}>;

/**
 * Counts mapped native nodes without rendering or touching Builder state.
 *
 * @example
 * const count = countSimulationNodes({ mappingPlan });
 */
export function countSimulationNodes(input: SimulationInput): number {
  return input.mappingPlan?.nodeCreationPlan.length ?? input.builderBlueprintResult?.metrics.widgetCount ?? input.compiledPlan?.sections.length ?? 0;
}

/**
 * Collects explicit missing facts from all simulation inputs.
 *
 * @example
 * const facts = collectSimulationMissingFacts(input);
 */
export function collectSimulationMissingFacts(input: SimulationInput): string[] {
  return [
    ...(input.websiteSpec?.missingFacts.map((fact) => fact.label) ?? []),
    ...(input.builderBlueprintResult?.blueprint.missingFacts.map((fact) => fact.label) ?? []),
    ...(input.compiledPlan?.missingFacts ?? []),
    ...(input.missingFacts?.map((fact) => fact.label) ?? []),
  ].filter(Boolean);
}

/**
 * Collects explicit missing assets from all simulation inputs.
 *
 * @example
 * const assets = collectSimulationMissingAssets(input);
 */
export function collectSimulationMissingAssets(input: SimulationInput): string[] {
  return [
    ...(input.compiledPlan?.missingAssets ?? []),
    ...(input.builderBlueprintResult?.blueprint.missingAssets ?? []),
    ...(input.mediaStrategy?.missingAssets ?? []),
    ...(input.mappingPlan?.assetPlan.filter((asset) => asset.missing).map((asset) => asset.assetLabel) ?? []),
    ...(input.missingAssets ?? []),
  ].filter(Boolean);
}
