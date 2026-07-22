import type { BuilderBreakpoint, EditablePropertyBinding, PropertyBinding, PropertyDefinition } from "./builderBlueprint";

/**
 * Builds property bindings that connect inspector controls to widget paths.
 *
 * @example
 * const bindings = buildPropertyBindings("heading_1", definitions);
 */
export function buildPropertyBindings(widgetId: string, definitions: readonly PropertyDefinition[], sourceModule = "builder-blueprint"): PropertyBinding[] {
  return definitions.map((definition) => Object.freeze({
    widgetId,
    propertyId: definition.id,
    widgetPropertyPath: definition.propertyPath,
    inspectorControl: definition.controlType,
    value: definition.currentValue,
    responsiveOverrides: definition.responsive ? ({ desktop: definition.currentValue, tablet: definition.currentValue, mobile: definition.currentValue } as Partial<Record<BuilderBreakpoint, unknown>>) : {},
    sourceModule,
    regenerationSafe: true,
  }));
}

/**
 * Marks property bindings as user-editable Inspector bindings.
 *
 * @example
 * const editable = buildEditablePropertyBindings(bindings, definitions);
 */
export function buildEditablePropertyBindings(bindings: readonly PropertyBinding[], definitions: readonly PropertyDefinition[]): EditablePropertyBinding[] {
  const byId = new Map(definitions.map((definition) => [definition.id, definition]));
  return bindings.map((binding) => {
    const definition = byId.get(binding.propertyId);
    return Object.freeze({
      ...binding,
      editable: true as const,
      userEditable: true as const,
      aiEditable: Boolean(definition?.aiEditable),
      protected: false,
    });
  });
}
