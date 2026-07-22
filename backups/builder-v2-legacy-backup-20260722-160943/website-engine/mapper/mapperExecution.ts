import type { BuilderCommand } from "../../core/commands/BuilderCommand";
import type { BuilderBlueprint, BuilderNode } from "../../types/blueprint";
import {
  MAPPER_EXECUTION_ENABLED,
  createEngineResult,
  createEngineWarning,
  type EngineResult,
  type EngineWarning,
} from "../sdk";
import { resolveAssetMappings, type ResolvedAssetMapping } from "./assetResolver";
import { buildCommandObjectsFromPlan } from "./commandExecutor";
import type { NativeBuilderMappingPlan } from "./mapperPlan";
import { createNativeBuilderNodesFromPlan } from "./nodeFactory";
import { applyPropertyMappings, type AppliedPropertyMapping } from "./propertyApplier";
import { applyResponsiveMappings, type AppliedResponsiveMapping } from "./responsiveApplier";
import { applyStyleMappings, type AppliedStyleMapping } from "./styleApplier";
import {
  validateMapperExecutionInput,
  validateMapperExecutionResult,
  type MapperExecutionValidationResult,
} from "./executionValidation";

export type MapperExecutionContext = Readonly<{
  featureFlags?: Readonly<Record<string, boolean>>;
  manualExecutionApproved?: boolean;
  allowStoreMutation?: boolean;
  executeCommands?: boolean;
  targetBlueprint?: BuilderBlueprint;
}>;

export type MapperExecutionInput = Readonly<{
  mappingPlan: NativeBuilderMappingPlan;
  context?: MapperExecutionContext;
}>;

export type MapperExecutionResult = Readonly<{
  id: string;
  version: string;
  blocked: boolean;
  executed: false;
  reason?: "MAPPER_EXECUTION_DISABLED" | "MAPPING_PLAN_INVALID" | "EXECUTION_MATERIALIZED_ONLY";
  nodes: BuilderNode[];
  commands: BuilderCommand[];
  propertyMappings: AppliedPropertyMapping[];
  styleMappings: AppliedStyleMapping[];
  responsiveMappings: AppliedResponsiveMapping[];
  assetMappings: ResolvedAssetMapping[];
  validation: MapperExecutionValidationResult;
  warnings: EngineWarning[];
  storeMutated: false;
  commandExecutionAttempted: false;
  trace: string[];
}>;

function mapperExecutionFlagEnabled(context?: MapperExecutionContext): boolean {
  const globalFlag = Boolean(MAPPER_EXECUTION_ENABLED);
  const contextFlag = context?.featureFlags?.MAPPER_EXECUTION_ENABLED === true;
  return globalFlag && contextFlag && context?.manualExecutionApproved === true;
}

function blockedResult(input: MapperExecutionInput, validation: MapperExecutionValidationResult, reason: MapperExecutionResult["reason"], warnings: EngineWarning[]): MapperExecutionResult {
  return Object.freeze({
    id: `${input.mappingPlan.id}.execution`,
    version: input.mappingPlan.version,
    blocked: true,
    executed: false as const,
    reason,
    nodes: [],
    commands: [],
    propertyMappings: [],
    styleMappings: [],
    responsiveMappings: [],
    assetMappings: [],
    validation,
    warnings,
    storeMutated: false as const,
    commandExecutionAttempted: false as const,
    trace: [
      "Mapper execution validation ran before materialization.",
      reason === "MAPPER_EXECUTION_DISABLED" ? "Execution hard-blocked because mapper execution feature flag is false by default." : "Execution blocked because validation failed.",
    ],
  });
}

/**
 * Converts a validated mapping plan into native Builder-compatible objects only when explicitly enabled.
 *
 * The default BuildEZ flag is false, so normal calls return a blocked EngineResult and never write to the
 * Builder store, execute CommandBus commands, render UI, or wire production behavior.
 *
 * @example
 * const result = executeNativeBuilderMappingPlan({ mappingPlan });
 */
export function executeNativeBuilderMappingPlan(input: MapperExecutionInput): EngineResult<MapperExecutionResult> {
  const featureFlagEnabled = mapperExecutionFlagEnabled(input.context);
  const validation = validateMapperExecutionInput({ mappingPlan: input.mappingPlan, featureFlagEnabled });
  if (!validation.valid) {
    const warning = createEngineWarning("MAPPER_EXECUTION_PLAN_INVALID", "Mapper execution input failed validation.", "mapper", "major", {
      issueCount: validation.issues.length,
    });
    const data = blockedResult(input, validation, "MAPPING_PLAN_INVALID", [warning]);
    return createEngineResult({
      module: "mapper",
      stage: "execution",
      status: "blocked",
      warnings: [warning],
      data,
      metadata: { blocked: true, reason: data.reason, issueCount: validation.issues.length },
    });
  }

  if (!featureFlagEnabled) {
    const warning = createEngineWarning("MAPPER_EXECUTION_DISABLED", "Native Builder mapper execution is disabled by feature flag.", "mapper", "info", {
      featureFlag: "MAPPER_EXECUTION_ENABLED",
      defaultValue: false,
    });
    const data = blockedResult(input, validation, "MAPPER_EXECUTION_DISABLED", [warning]);
    return createEngineResult({
      module: "mapper",
      stage: "execution",
      status: "blocked",
      warnings: [warning],
      data,
      metadata: { blocked: true, reason: data.reason, featureFlag: false },
    });
  }

  const nodes = createNativeBuilderNodesFromPlan(input.mappingPlan);
  const commands = buildCommandObjectsFromPlan(input.mappingPlan);
  const propertyMappings = applyPropertyMappings(input.mappingPlan);
  const styleMappings = applyStyleMappings(input.mappingPlan);
  const responsiveMappings = applyResponsiveMappings(input.mappingPlan);
  const assetMappings = resolveAssetMappings(input.mappingPlan);
  const resultValidation = validateMapperExecutionResult({
    blocked: false,
    nodes,
    commands,
    storeMutated: false,
    commandExecutionAttempted: false,
    trace: ["Execution materialized native-compatible objects only."],
  });
  const warnings = resultValidation.valid
    ? []
    : [
        createEngineWarning("MAPPER_EXECUTION_RESULT_INVALID", "Mapper execution result failed validation.", "mapper", "major", {
          issueCount: resultValidation.issues.length,
        }),
      ];
  const data: MapperExecutionResult = Object.freeze({
    id: `${input.mappingPlan.id}.execution`,
    version: input.mappingPlan.version,
    blocked: false,
    executed: false as const,
    reason: "EXECUTION_MATERIALIZED_ONLY",
    nodes,
    commands,
    propertyMappings,
    styleMappings,
    responsiveMappings,
    assetMappings,
    validation: resultValidation,
    warnings,
    storeMutated: false as const,
    commandExecutionAttempted: false as const,
    trace: [
      "Mapper execution feature gate was explicitly enabled.",
      "Native-compatible nodes and command objects were materialized without store mutation or command execution.",
    ],
  });
  return createEngineResult({
    module: "mapper",
    stage: "execution",
    status: resultValidation.valid ? "ok" : "blocked",
    warnings,
    data,
    metadata: {
      blocked: data.blocked,
      nodeCount: nodes.length,
      commandCount: commands.length,
      storeMutated: false,
      commandExecutionAttempted: false,
    },
  });
}
