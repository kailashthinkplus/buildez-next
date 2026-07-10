import type { NodeType } from "../types/blueprint";

export type NativeAIWidgetType =
  | "page"
  | "section"
  | "container"
  | "column"
  | "heading"
  | "text"
  | "button"
  | "image"
  | "video"
  | "icon"
  | "divider"
  | "spacer";

export type AICapabilityState = "safe" | "unsafe" | "blocked" | "unknown";

export type AINodeCapability = Readonly<{
  nodeType: NativeAIWidgetType;
  nativeNodeType: NodeType;
  canContainChildren: boolean;
  canAIInsert: boolean;
  canAIEditContent: boolean;
  canAIEditStyle: boolean;
  canAIEditResponsive: boolean;
  canAIReplace: boolean;
  canAIRegenerate: boolean;
  canAIPreserveUserEdits: boolean;
  canAIUseInspector: boolean;
  canAIUseCommandBus: boolean;
  canAIPublishSafely: boolean;
  state: AICapabilityState;
  blockers: string[];
  notes: string[];
}>;

export type AIWidgetCapability = AINodeCapability & Readonly<{
  widgetName: string;
  contentFields: string[];
  styleFields: string[];
  responsiveFields: string[];
}>;

const CONTAINER_TYPES = new Set<NativeAIWidgetType>([
  "page",
  "section",
  "container",
  "column",
]);

const WIDGET_FIELD_MAP: Record<NativeAIWidgetType, Pick<AIWidgetCapability, "widgetName" | "contentFields" | "styleFields" | "responsiveFields">> = {
  page: { widgetName: "Page", contentFields: ["metadata.title"], styleFields: ["style", "theme"], responsiveFields: ["style.width"] },
  section: { widgetName: "Section", contentFields: ["name"], styleFields: ["style", "props.widthMode"], responsiveFields: ["style.padding", "style.gap"] },
  container: { widgetName: "Container", contentFields: ["name"], styleFields: ["style", "props.layout"], responsiveFields: ["style.width", "style.gap"] },
  column: { widgetName: "Column", contentFields: ["name"], styleFields: ["style", "props.layout"], responsiveFields: ["style.width", "style.flex"] },
  heading: { widgetName: "Heading", contentFields: ["props.text", "props.level"], styleFields: ["style.fontSize", "style.color"], responsiveFields: ["style.fontSize"] },
  text: { widgetName: "Text", contentFields: ["props.text", "props.html"], styleFields: ["style.fontSize", "style.color"], responsiveFields: ["style.fontSize"] },
  button: { widgetName: "Button", contentFields: ["props.label", "props.text", "props.href", "props.url"], styleFields: ["style.backgroundColor", "style.color", "style.borderRadius"], responsiveFields: ["style.width"] },
  image: { widgetName: "Image", contentFields: ["props.src", "props.alt"], styleFields: ["style.width", "style.aspectRatio", "style.objectFit"], responsiveFields: ["style.width"] },
  video: { widgetName: "Video", contentFields: ["props.src", "props.poster"], styleFields: ["style.width", "style.aspectRatio"], responsiveFields: ["style.width"] },
  icon: { widgetName: "Icon", contentFields: ["props.iconName", "props.ariaLabel"], styleFields: ["style.color", "style.fontSize"], responsiveFields: ["style.fontSize"] },
  divider: { widgetName: "Divider", contentFields: ["props.orientation"], styleFields: ["style.width", "style.height", "style.color"], responsiveFields: ["style.width"] },
  spacer: { widgetName: "Spacer", contentFields: [], styleFields: ["style.height", "style.width"], responsiveFields: ["style.height", "style.width"] },
};

export const NATIVE_AI_WIDGET_TYPES: readonly NativeAIWidgetType[] = Object.freeze([
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

export function buildNodeCapabilities(): AINodeCapability[] {
  return NATIVE_AI_WIDGET_TYPES.map((type) => buildNodeCapability(type));
}

export function buildWidgetCapabilities(): AIWidgetCapability[] {
  return NATIVE_AI_WIDGET_TYPES.map((type) => ({
    ...buildNodeCapability(type),
    ...WIDGET_FIELD_MAP[type],
  }));
}

function buildNodeCapability(type: NativeAIWidgetType): AINodeCapability {
  const contentCapable = WIDGET_FIELD_MAP[type].contentFields.length > 0;
  const styleCapable = WIDGET_FIELD_MAP[type].styleFields.length > 0;

  return Object.freeze({
    nodeType: type,
    nativeNodeType: type,
    canContainChildren: CONTAINER_TYPES.has(type),
    canAIInsert: false,
    canAIEditContent: contentCapable,
    canAIEditStyle: styleCapable,
    canAIEditResponsive: false,
    canAIReplace: type !== "page",
    canAIRegenerate: false,
    canAIPreserveUserEdits: false,
    canAIUseInspector: false,
    canAIUseCommandBus: false,
    canAIPublishSafely: false,
    state: "blocked",
    blockers: [
      "RELEASE_GATE_FAILED",
      "SERIALIZATION_UNSTABLE",
      "RESPONSIVE_UNSTABLE",
      "INSPECTOR_BINDINGS_UNPROVEN",
      "CANVAS_RUNTIME_PARITY_UNPROVEN",
    ],
    notes: [
      "Native widget shape is known, but AI mutation is blocked until Builder stabilization gates pass.",
      contentCapable ? "Content fields are identifiable for future AI editing." : "Widget has no primary content fields.",
      styleCapable ? "Style fields are identifiable for future AI editing." : "Widget has limited style fields.",
    ],
  });
}
