import type { NodeType } from "../../types/blueprint";

export const NATIVE_RENDER_WIDGETS: readonly NodeType[] = Object.freeze([
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
]);

const NATIVE_RENDER_WIDGET_SET = new Set<NodeType>(NATIVE_RENDER_WIDGETS);

export function isNativeRenderWidget(type: NodeType): boolean {
  return NATIVE_RENDER_WIDGET_SET.has(type);
}

export function getUnsupportedWidgetFallback(type: NodeType): "premium" | "generic" {
  return NATIVE_RENDER_WIDGET_SET.has(type) ? "generic" : "premium";
}
