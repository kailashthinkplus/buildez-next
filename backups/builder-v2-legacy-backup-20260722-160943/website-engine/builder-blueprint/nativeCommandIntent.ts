import type { NativeCommandIntent, WidgetBlueprint } from "./builderBlueprint";
import { widgetToNativeNode } from "./builderBlueprint";

/**
 * Builds future CommandBus-compatible intents without executing commands.
 *
 * @example
 * const commands = buildNativeCommandIntents(widgets);
 */
export function buildNativeCommandIntents(widgets: readonly WidgetBlueprint[]): NativeCommandIntent[] {
  return widgets.flatMap((widget, index) => {
    const node = widgetToNativeNode(widget);
    const insert: NativeCommandIntent = Object.freeze({
      commandType: "InsertNodeCommand",
      targetNodeId: widget.id,
      parentId: widget.parentId,
      node,
      index,
      description: "Future mapper can insert this existing BuilderNode through InsertNodeCommand.",
    });
    const update: NativeCommandIntent = Object.freeze({
      commandType: "UpdateNodeCommand",
      targetNodeId: widget.id,
      patch: { props: widget.props, style: widget.style },
      description: "Future mapper can update props/style through UpdateNodeCommand.",
    });
    const style: NativeCommandIntent = Object.freeze({
      commandType: "StyleCommands",
      targetNodeId: widget.id,
      stylePatch: widget.style,
      description: "Future mapper can route style patches through existing style command concepts.",
    });
    const structural: NativeCommandIntent[] = widget.parentId
      ? [
          Object.freeze({ commandType: "MoveNodeCommand" as const, targetNodeId: widget.id, parentId: widget.parentId, index, description: "Future mapper can move nodes through MoveNodeCommand." }),
          Object.freeze({ commandType: "ReorderNodeCommand" as const, targetNodeId: widget.id, index, description: "Future mapper can reorder nodes through ReorderNodeCommand." }),
          Object.freeze({ commandType: "DuplicateNodeCommand" as const, targetNodeId: widget.id, description: "Future mapper can duplicate nodes through DuplicateNodeCommand." }),
        ]
      : [];
    return [insert, update, style, ...structural];
  });
}
