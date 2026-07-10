import type { ContainerBlueprint, ResponsiveBlueprint, WidgetBlueprint, WidgetTreeNode } from "./builderBlueprint";
import { buildWidgetCapabilities } from "./widgetCapabilities";

function toTree(widget: WidgetBlueprint, byId: Map<string, WidgetBlueprint>): WidgetTreeNode {
  return Object.freeze({
    id: widget.id,
    type: widget.type,
    parentId: widget.parentId,
    children: widget.children.map((childId) => {
      const child = byId.get(childId);
      return child ? toTree(child, byId) : Object.freeze({ id: childId, type: "spacer" as const, parentId: widget.id, children: [] });
    }),
  });
}

/**
 * Builds container blueprints from section widget descendants.
 *
 * @example
 * const containers = buildContainerBlueprints("section.hero", widgets);
 */
export function buildContainerBlueprints(sectionId: string, widgets: readonly WidgetBlueprint[]): ContainerBlueprint[] {
  const byId = new Map(widgets.map((widget) => [widget.id, widget]));
  return widgets.filter((widget) => widget.type === "container").map((container) => {
    const responsive: ResponsiveBlueprint = Object.freeze({
      breakpoints: ["desktop", "tablet", "mobile"],
      bindings: container.responsiveBindings,
    });
    return Object.freeze({
      id: container.id,
      sectionId,
      widgetIds: [container.id, ...container.children],
      tree: toTree(container, byId),
      responsive,
      capabilities: buildWidgetCapabilities("container"),
    });
  });
}

export { toTree as widgetBlueprintToTree };
