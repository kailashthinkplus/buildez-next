import type { BuilderBlueprintValidationResult, BuilderBlueprintWarning } from "../builder-blueprint";
import type { AssetMappingPlan } from "./assetMappingPlan";
import type { CommandMappingPlan } from "./commandMappingPlan";
import type { NodeMappingPlan } from "./nodeMappingPlan";
import type { PropertyMappingPlan } from "./propertyMappingPlan";
import type { ResponsiveMappingPlan } from "./responsiveMappingPlan";
import type { StyleMappingPlan } from "./styleMappingPlan";

export type MapperWarning = BuilderBlueprintWarning;
export type MapperMetrics = Readonly<{ nodePlanCount: number; commandPlanCount: number; propertyPlanCount: number; stylePlanCount: number; responsivePlanCount: number; assetPlanCount: number; warningCount: number }>;

export type NativeBuilderMappingPlan = Readonly<{
  id: string;
  version: string;
  sourceBuilderBlueprintId?: string;
  nodeCreationPlan: NodeMappingPlan[];
  commandPlan: CommandMappingPlan[];
  propertyPlan: PropertyMappingPlan[];
  stylePlan: StyleMappingPlan[];
  responsivePlan: ResponsiveMappingPlan[];
  assetPlan: AssetMappingPlan[];
  validation: BuilderBlueprintValidationResult;
  warnings: MapperWarning[];
  metrics: MapperMetrics;
  trace: string[];
  executed: false;
}>;

export type MapperResult = Readonly<{ mappingPlan: NativeBuilderMappingPlan; validation: BuilderBlueprintValidationResult; warnings: MapperWarning[]; metrics: MapperMetrics; trace: string[] }>;

export function collectMapperMetrics(plan: Omit<NativeBuilderMappingPlan, "metrics">): MapperMetrics {
  return Object.freeze({
    nodePlanCount: plan.nodeCreationPlan.length,
    commandPlanCount: plan.commandPlan.length,
    propertyPlanCount: plan.propertyPlan.length,
    stylePlanCount: plan.stylePlan.length,
    responsivePlanCount: plan.responsivePlan.length,
    assetPlanCount: plan.assetPlan.length,
    warningCount: plan.warnings.length,
  });
}
