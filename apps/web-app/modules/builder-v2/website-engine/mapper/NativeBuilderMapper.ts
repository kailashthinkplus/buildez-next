import { createEngineResult, type EngineResult } from "../sdk";
import { buildAssetMappingPlan } from "./assetMappingPlan";
import { buildCommandMappingPlan } from "./commandMappingPlan";
import type { MapperInput } from "./mapperInput";
import { collectMapperMetrics, type MapperResult, type MapperWarning, type NativeBuilderMappingPlan } from "./mapperPlan";
import { buildNodeMappingPlan } from "./nodeMappingPlan";
import { buildPropertyMappingPlan } from "./propertyMappingPlan";
import { buildResponsiveMappingPlan } from "./responsiveMappingPlan";
import { buildStyleMappingPlan } from "./styleMappingPlan";
import { validateNativeBuilderMappingPlan } from "./validation";
import { NATIVE_BUILDER_MAPPER_VERSION_STRING } from "./version";

function buildTrace(input: MapperInput) {
  return [
    "native-builder-mapper.contract-only",
    ...(input.builderBlueprintResult ? ["builder-blueprint-result"] : []),
    ...(input.builderBlueprint ? ["builder-blueprint"] : []),
    "no-command-execution",
    "no-builder-store-write",
    "no-rendering",
    "no-production-wiring",
  ];
}

/**
 * Builds an inert native Builder mapping plan from Builder Blueprint intents.
 *
 * @example
 * const plan = buildNativeBuilderMappingPlan({ builderBlueprintResult });
 */
export function buildNativeBuilderMappingPlan(input: MapperInput = {}): NativeBuilderMappingPlan {
  const sourceBlueprint = input.builderBlueprint ?? input.builderBlueprintResult?.blueprint;
  const partial = Object.freeze({
    id: "native-builder-mapping-plan.local",
    version: NATIVE_BUILDER_MAPPER_VERSION_STRING,
    sourceBuilderBlueprintId: sourceBlueprint?.id,
    nodeCreationPlan: buildNodeMappingPlan(input),
    commandPlan: buildCommandMappingPlan(input),
    propertyPlan: buildPropertyMappingPlan(input),
    stylePlan: buildStyleMappingPlan(input),
    responsivePlan: buildResponsiveMappingPlan(input),
    assetPlan: buildAssetMappingPlan(input),
    validation: Object.freeze({ valid: true, issues: [] }),
    warnings: [] as MapperWarning[],
    trace: buildTrace(input),
    executed: false as const,
  });
  const withMetrics = Object.freeze({ ...partial, metrics: collectMapperMetrics(partial) });
  return Object.freeze({ ...withMetrics, validation: validateNativeBuilderMappingPlan(withMetrics) });
}

/**
 * Runs the contract-only Native Builder Mapper.
 *
 * @example
 * const result = runNativeBuilderMapper({ builderBlueprintResult });
 */
export function runNativeBuilderMapper(input: MapperInput = {}): EngineResult<MapperResult> {
  const plan = buildNativeBuilderMappingPlan(input);
  const validationWarnings: MapperWarning[] = plan.validation.issues.map((item) => Object.freeze({
    code: item.code,
    message: `${item.path}: ${item.message}`,
    module: "mapper",
    severity: "major" as const,
  }));
  const finalPlan = validationWarnings.length
    ? Object.freeze({ ...plan, warnings: validationWarnings, metrics: Object.freeze({ ...plan.metrics, warningCount: validationWarnings.length }) })
    : plan;
  const result: MapperResult = Object.freeze({
    mappingPlan: finalPlan,
    validation: finalPlan.validation,
    warnings: finalPlan.warnings,
    metrics: finalPlan.metrics,
    trace: finalPlan.trace,
  });
  return createEngineResult({
    module: "mapper",
    stage: "native-builder-mapping-plan",
    status: finalPlan.validation.valid && finalPlan.warnings.length === 0 ? "ok" : "warning",
    warnings: finalPlan.warnings,
    data: result,
    metadata: {
      localOnly: true,
      contractOnly: true,
      commandExecution: false,
      builderStoreWrite: false,
      nodePlanCount: finalPlan.metrics.nodePlanCount,
    },
  });
}
