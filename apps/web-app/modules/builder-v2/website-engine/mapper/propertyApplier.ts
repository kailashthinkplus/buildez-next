import type { NativeBuilderMappingPlan } from "./mapperPlan";

export type AppliedPropertyMapping = Readonly<{ id: string; nodeId: string; propertyPath: string; value: unknown; applied: false }>;

/**
 * Converts property mappings into non-mutating application records.
 *
 * @example
 * const applied = applyPropertyMappings(plan);
 */
export function applyPropertyMappings(plan: NativeBuilderMappingPlan): AppliedPropertyMapping[] {
  return plan.propertyPlan.map((property) => Object.freeze({
    id: property.id,
    nodeId: property.widgetId,
    propertyPath: property.nativePropertyPath,
    value: property.sourceIntent.nativeProperty.defaultValue,
    applied: false as const,
  }));
}
