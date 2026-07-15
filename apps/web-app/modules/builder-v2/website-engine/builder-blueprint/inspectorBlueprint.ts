import type { InspectorBlueprint, PropertyDefinition, PropertyBinding, EditablePropertyBinding, ResponsiveBinding } from "./builderBlueprint";
import { buildPropertyGroups } from "./propertyGroups";

/**
 * Builds an InspectorBlueprint for a widget.
 *
 * @example
 * const inspector = buildInspectorBlueprint("heading_1", definitions, bindings, editable, responsive);
 */
export function buildInspectorBlueprint(
  widgetId: string,
  propertyDefinitions: readonly PropertyDefinition[],
  propertyBindings: readonly PropertyBinding[],
  editablePropertyBindings: readonly EditablePropertyBinding[],
  responsiveBindings: readonly ResponsiveBinding[]
): InspectorBlueprint {
  return Object.freeze({
    widgetId,
    tabs: ["content", "design", "advanced", "responsive", "ai"] as const,
    groups: buildPropertyGroups(),
    propertyDefinitions: [...propertyDefinitions],
    propertyBindings: [...propertyBindings],
    editablePropertyBindings: [...editablePropertyBindings],
    responsiveBindings: [...responsiveBindings],
  });
}
