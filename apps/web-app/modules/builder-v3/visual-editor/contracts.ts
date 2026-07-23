export const BUILDER_BRIDGE_VERSION = 1 as const;
export const BUILDER_TO_CANVAS_TYPES = ["BUILDEZ_EDIT_MODE_CHANGED", "BUILDEZ_REQUEST_PARENT_SELECTION", "BUILDEZ_SELECTION_CLEARED", "BUILDEZ_SCROLL_TO_ELEMENT"] as const;
export const CANVAS_TO_BUILDER_TYPES = ["BUILDEZ_PREVIEW_READY", "BUILDEZ_ELEMENT_HOVERED", "BUILDEZ_ELEMENT_SELECTED", "BUILDEZ_SELECTION_CLEARED", "BUILDEZ_ELEMENT_BOUNDS_CHANGED", "BUILDEZ_INLINE_EDIT_COMMITTED", "BUILDEZ_ROUTE_CHANGED", "BUILDEZ_RUNTIME_ERROR"] as const;
export type EditableCapability = "text" | "richText" | "image" | "link" | "data" | "spacing" | "typography" | "background" | "border" | "shadow" | "layout" | "responsive" | "customCss" | "structural" | "accessibility";
export type BuilderSelection = Readonly<{
  elementId: string; kind: string; tagName: string; sourceFile: string; sourceAnchor: string;
  parentElementId?: string; textContent?: string; className?: string;
  attributes?: Readonly<Record<string, string>>;
  computedStyleSummary?: Readonly<Record<string, string>>;
  editableCapabilities: readonly EditableCapability[]; projectRevision: number;
  bounds: Readonly<{ top: number; left: number; width: number; height: number }>;
}>;
export type BuilderBridgeMessage = Readonly<{
  version: typeof BUILDER_BRIDGE_VERSION; sessionId: string;
  type: (typeof BUILDER_TO_CANVAS_TYPES)[number] | (typeof CANVAS_TO_BUILDER_TYPES)[number]; payload: unknown;
}>;
export function validateBuilderBridgeMessage(value: unknown, input: { sessionId: string; direction: "to-canvas" | "to-builder" }): value is BuilderBridgeMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  const allowed = input.direction === "to-canvas" ? BUILDER_TO_CANVAS_TYPES : CANVAS_TO_BUILDER_TYPES;
  return message.version === BUILDER_BRIDGE_VERSION && message.sessionId === input.sessionId
    && typeof message.type === "string" && (allowed as readonly string[]).includes(message.type);
}
