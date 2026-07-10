import type { PropertyDefinition, ResponsiveBinding } from "./builderBlueprint";

/**
 * Builds responsive metadata for responsive-capable properties.
 *
 * @example
 * const bindings = buildResponsivePropertyBindings(definitions);
 */
export function buildResponsivePropertyBindings(definitions: readonly PropertyDefinition[]): ResponsiveBinding[] {
  return definitions.filter((definition) => definition.responsive).map((definition) => Object.freeze({
    propertyId: definition.id,
    defaultValue: definition.currentValue,
    overrides: {
      desktop: definition.currentValue,
      tablet: definition.currentValue,
      mobile: definition.currentValue,
    },
    inheritance: "desktop-first" as const,
    userOverride: true,
  }));
}

export const buildResponsiveBindings = buildResponsivePropertyBindings;
