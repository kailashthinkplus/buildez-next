import type { NodeType } from "../../types/blueprint";
import type { BuilderPrimitiveType, NativeWidgetIntent, WidgetBlueprint } from "./builderBlueprint";

export const NATIVE_BUILDER_WIDGET_TYPES: readonly BuilderPrimitiveType[] = [
  "page",
  "section",
  "container",
  "column",
  "heading",
  "text",
  "button",
  "image",
  "video",
  "icon",
  "divider",
  "spacer",
];

const nativeTypeSet = new Set<string>(NATIVE_BUILDER_WIDGET_TYPES);

/**
 * Checks whether a generated primitive maps to an existing native Builder widget type.
 *
 * @example
 * const supported = isNativeSupportedWidgetType("heading");
 */
export function isNativeSupportedWidgetType(type: string): type is BuilderPrimitiveType {
  return nativeTypeSet.has(type);
}

/**
 * Converts a WidgetBlueprint into a native widget intent.
 *
 * @example
 * const intent = toNativeWidgetIntent(widget);
 */
export function toNativeWidgetIntent(widget: WidgetBlueprint): NativeWidgetIntent {
  return Object.freeze({
    widgetId: widget.id,
    widgetType: widget.type as NodeType,
    registeredWidgetType: true,
    props: widget.props,
    style: widget.style,
    childIds: widget.children,
  });
}

/**
 * Converts WidgetBlueprints into native widget intents.
 *
 * @example
 * const intents = buildNativeWidgetIntents(widgets);
 */
export function buildNativeWidgetIntents(widgets: readonly WidgetBlueprint[]): NativeWidgetIntent[] {
  return widgets.filter((widget) => isNativeSupportedWidgetType(widget.type)).map(toNativeWidgetIntent);
}
