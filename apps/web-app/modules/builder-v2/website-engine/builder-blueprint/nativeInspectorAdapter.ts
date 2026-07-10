import type { WidgetProperty, PropertyType } from "../../types/property";
import type { NativeInspectorBindingIntent, PropertyControlType, PropertyDefinition, WidgetBlueprint } from "./builderBlueprint";

function toNativePropertyType(control: PropertyControlType): PropertyType {
  if (control === "richText") return "textarea";
  if (control === "toggle") return "switch";
  if (control === "link") return "url";
  if (control === "video") return "url";
  if (control === "animation") return "responsive";
  return control;
}

function toNativeCategory(group: PropertyDefinition["group"]): WidgetProperty["category"] {
  if (group === "content" || group === "media" || group === "button") return "content";
  if (group === "layout" || group === "spacing") return "layout";
  if (group === "advanced" || group === "ai") return "advanced";
  if (group === "animation") return "animation";
  if (group === "responsive") return "responsive";
  return "style";
}

/**
 * Converts InspectorBlueprint property definitions into existing WidgetProperty intent.
 *
 * @example
 * const native = toNativeWidgetProperty(definition);
 */
export function toNativeWidgetProperty(definition: PropertyDefinition): WidgetProperty {
  const target = definition.propertyPath.startsWith("style.") ? "style" : definition.propertyPath.startsWith("props.") ? "props" : undefined;
  return Object.freeze({
    id: definition.propertyPath.split(".").pop() ?? definition.id,
    label: definition.label,
    type: toNativePropertyType(definition.controlType),
    target,
    category: toNativeCategory(definition.group),
    defaultValue: definition.defaultValue,
    options: definition.allowedValues?.map((value) => ({ label: String(value), value })),
    responsive: definition.responsive,
    aiEditable: definition.aiEditable,
    min: definition.min,
    max: definition.max,
    step: definition.step,
    unit: definition.unitOptions?.[0],
    description: definition.helpText,
  });
}

/**
 * Builds native inspector binding intents for WidgetProperty-compatible inspector controls.
 *
 * @example
 * const intents = buildNativeInspectorBindingIntents(widgets);
 */
export function buildNativeInspectorBindingIntents(widgets: readonly WidgetBlueprint[]): NativeInspectorBindingIntent[] {
  return widgets.flatMap((widget) =>
    widget.propertyDefinitions.map((definition) => Object.freeze({
      widgetId: widget.id,
      propertyId: definition.id,
      nativePropertyPath: definition.propertyPath,
      nativeProperty: toNativeWidgetProperty(definition),
      sourceInspectorDefinitionId: definition.id,
    }))
  );
}
