import type { BuilderNode } from "../../types/blueprint";
import type { NativeBuilderNodeIntent, WidgetBlueprint } from "./builderBlueprint";
import { widgetToNativeNode } from "./builderBlueprint";

/**
 * Converts a WidgetBlueprint into an existing BuilderNode-shaped intent.
 *
 * @example
 * const intent = toNativeBuilderNodeIntent(widget, 0);
 */
export function toNativeBuilderNodeIntent(widget: WidgetBlueprint, insertIndex?: number): NativeBuilderNodeIntent {
  const node: BuilderNode = widgetToNativeNode(widget);
  return Object.freeze({
    node,
    sourceWidgetId: widget.id,
    insertParentId: widget.parentId,
    insertIndex,
    commandType: "InsertNodeCommand",
  });
}

/**
 * Converts generated widgets into native node insertion intents.
 *
 * @example
 * const intents = buildNativeNodeIntents(widgets);
 */
export function buildNativeNodeIntents(widgets: readonly WidgetBlueprint[]): NativeBuilderNodeIntent[] {
  return widgets.map((widget, index) => toNativeBuilderNodeIntent(widget, index));
}
