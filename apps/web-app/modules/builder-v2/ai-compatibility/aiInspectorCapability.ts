import type { NativeAIWidgetType } from "./aiNodeCapability";

export type AIInspectorCapability = Readonly<{
  widgetType: NativeAIWidgetType;
  canUseContentTab: boolean;
  canUseStyleTab: boolean;
  canUseAdvancedTab: boolean;
  responsiveBindingSafe: boolean;
  propertyBindingVerified: boolean;
  unsupportedControls: string[];
  blockers: string[];
}>;

const CONTENT_TAB_WIDGETS = new Set<NativeAIWidgetType>([
  "heading",
  "text",
  "button",
  "image",
  "video",
  "icon",
  "divider",
  "spacer",
]);

export function buildInspectorCapabilities(widgetTypes: readonly NativeAIWidgetType[]): AIInspectorCapability[] {
  return widgetTypes.map((widgetType) =>
    Object.freeze({
      widgetType,
      canUseContentTab: CONTENT_TAB_WIDGETS.has(widgetType),
      canUseStyleTab: true,
      canUseAdvancedTab: false,
      responsiveBindingSafe: false,
      propertyBindingVerified: false,
      unsupportedControls: [
        "generic color schema falls back to text input in some paths",
        "unit picker is missing",
        "advanced motion and custom CSS are not AI-safe",
        "responsive inspector device state is not unified with canvas state",
      ],
      blockers: ["BUG-0002", "BUG-0007", "BUG-0006", "BUG-0044"],
    })
  );
}
