import type { NativeBuilderMappingPlan } from "./mapperPlan";

export type AppliedResponsiveMapping = Readonly<{ id: string; propertyId: string; breakpoints: readonly string[]; overrides: Record<string, unknown>; applied: false }>;

/**
 * Converts responsive mappings into non-mutating application records.
 *
 * @example
 * const responsive = applyResponsiveMappings(plan);
 */
export function applyResponsiveMappings(plan: NativeBuilderMappingPlan): AppliedResponsiveMapping[] {
  return plan.responsivePlan.map((responsive) => Object.freeze({
    id: responsive.id,
    propertyId: responsive.propertyId,
    breakpoints: responsive.breakpoints,
    overrides: responsive.overrides,
    applied: false as const,
  }));
}
