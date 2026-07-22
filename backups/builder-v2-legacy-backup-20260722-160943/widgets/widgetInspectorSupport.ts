import { buildWidgetCapabilities } from "./widgetCapabilities";

export type WidgetInspectorSupport = Readonly<{
  type: string;
  hasContentControls: boolean;
  hasDesignControls: boolean;
  hasAdvancedControls: boolean;
  hasResponsiveControls: boolean;
  hasThemeTokenCompatibility: boolean;
  motionReadyMetadata: boolean;
  aiReadyMetadataOnly: boolean;
}>;

export function buildWidgetInspectorSupport(): WidgetInspectorSupport[] {
  return buildWidgetCapabilities().map((capability) => ({
    type: String(capability.type),
    hasContentControls: capability.supportedInspectorGroups.includes("content"),
    hasDesignControls: capability.supportedInspectorGroups.includes("design"),
    hasAdvancedControls: capability.supportedInspectorGroups.includes("advanced"),
    hasResponsiveControls: capability.supportedInspectorGroups.includes("responsive") || capability.responsiveFields.length > 0,
    hasThemeTokenCompatibility: capability.supportedInspectorGroups.includes("theme") || capability.themeTokenFields.length > 0,
    motionReadyMetadata: capability.supportedInspectorGroups.includes("motion") || capability.scaffoldOnly,
    aiReadyMetadataOnly: capability.aiReadinessStatus !== "production-ready",
  }));
}

export function getWidgetInspectorSupport(type: string): WidgetInspectorSupport | undefined {
  return buildWidgetInspectorSupport().find((support) => support.type === type);
}
