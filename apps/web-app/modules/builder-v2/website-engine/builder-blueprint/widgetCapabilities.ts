import type { BuilderPrimitiveType, WidgetCapabilities } from "./builderBlueprint";

/**
 * Builds widget capabilities for editable native primitives.
 *
 * @example
 * const capabilities = buildWidgetCapabilities("heading");
 */
export function buildWidgetCapabilities(type: BuilderPrimitiveType): WidgetCapabilities {
  const canNest = ["page", "section", "container", "column"].includes(type);
  return Object.freeze({
    canEdit: true,
    canMove: type !== "page",
    canDuplicate: type !== "page",
    canDelete: type !== "page",
    canResize: type !== "page",
    canHide: type !== "page",
    canLock: true,
    canAnimate: type !== "page",
    canRegenerate: true,
    canReplace: type !== "page",
    canNest,
    canReorder: type !== "page",
    canBindData: true,
  });
}
