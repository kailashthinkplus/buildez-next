import type { NativeBlueprintCompatibilityResult, WidgetBlueprint } from "./builderBlueprint";
import { buildNativeCommandIntents } from "./nativeCommandIntent";
import { buildNativeInspectorBindingIntents } from "./nativeInspectorAdapter";
import { buildNativeNodeIntents } from "./nativeNodeAdapter";
import { buildNativeWidgetIntents, isNativeSupportedWidgetType, NATIVE_BUILDER_WIDGET_TYPES } from "./nativeWidgetAdapter";

const allowedPropertyPrefixes = ["props.", "style.", "name", "metadata."];

/**
 * Checks whether generated blueprint metadata maps to existing Builder node/widget/property concepts.
 *
 * @example
 * const compatibility = validateNativeBlueprintCompatibility(widgets);
 */
export function validateNativeBlueprintCompatibility(widgets: readonly WidgetBlueprint[]): NativeBlueprintCompatibilityResult {
  const unsupportedWidgetTypes = Array.from(new Set(widgets.filter((widget) => !isNativeSupportedWidgetType(widget.type)).map((widget) => widget.type)));
  const unsupportedPropertyIds = widgets.flatMap((widget) =>
    widget.propertyDefinitions
      .filter((definition) => !allowedPropertyPrefixes.some((prefix) => definition.propertyPath === prefix.slice(0, -1) || definition.propertyPath.startsWith(prefix)))
      .map((definition) => definition.id)
  );
  const nodeIntents = buildNativeNodeIntents(widgets);
  const widgetIntents = buildNativeWidgetIntents(widgets);
  const inspectorBindingIntents = buildNativeInspectorBindingIntents(widgets);
  const commandIntents = buildNativeCommandIntents(widgets);
  return Object.freeze({
    compatible: unsupportedWidgetTypes.length === 0 && unsupportedPropertyIds.length === 0 && widgetIntents.length === widgets.length,
    supportedWidgetTypes: [...NATIVE_BUILDER_WIDGET_TYPES],
    unsupportedWidgetTypes,
    unsupportedPropertyIds,
    nodeIntents,
    widgetIntents,
    inspectorBindingIntents,
    commandIntents,
    notes: [
      "Builder Blueprint is an AI translation layer into existing BuilderNode, NodeType, WidgetProperty, and CommandBus concepts.",
      "No Builder store insertion or command execution happens in this layer.",
    ],
  });
}
