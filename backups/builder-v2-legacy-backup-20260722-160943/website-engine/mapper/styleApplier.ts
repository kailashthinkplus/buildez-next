import type { NativeBuilderMappingPlan } from "./mapperPlan";

export type AppliedStyleMapping = Readonly<{ id: string; nodeId: string; stylePath: string; value: unknown; applied: false }>;

/**
 * Converts style mappings into non-mutating application records.
 *
 * @example
 * const styles = applyStyleMappings(plan);
 */
export function applyStyleMappings(plan: NativeBuilderMappingPlan): AppliedStyleMapping[] {
  return plan.stylePlan.map((style) => Object.freeze({
    id: style.id,
    nodeId: style.nodeId,
    stylePath: style.nativeStylePathIntent,
    value: style.value,
    applied: false as const,
  }));
}
