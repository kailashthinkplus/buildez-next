import type { MapperInput } from "./mapperInput";

/**
 * Responsive mapping plan for desktop/tablet/mobile metadata.
 *
 * @example
 * const responsive = buildResponsiveMappingPlan(input);
 */
export type ResponsiveMappingPlan = Readonly<{
  id: string;
  propertyId: string;
  breakpoints: readonly ("desktop" | "tablet" | "mobile")[];
  defaultValue: unknown;
  overrides: Record<string, unknown>;
  inheritance: "desktop-first" | "independent";
  executed: false;
}>;

/**
 * Builds responsive mapping plans from blueprint responsive bindings.
 *
 * @example
 * const responsive = buildResponsiveMappingPlan(input);
 */
export function buildResponsiveMappingPlan(input: MapperInput): ResponsiveMappingPlan[] {
  const bindings = input.builderBlueprint?.responsiveBindings ?? input.builderBlueprintResult?.responsiveBindings ?? [];
  return bindings.map((binding) => Object.freeze({
    id: `responsive-map.${binding.propertyId}`,
    propertyId: binding.propertyId,
    breakpoints: ["desktop", "tablet", "mobile"] as const,
    defaultValue: binding.defaultValue,
    overrides: binding.overrides,
    inheritance: binding.inheritance,
    executed: false as const,
  }));
}
