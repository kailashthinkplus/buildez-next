import type { NativeAIWidgetType } from "./aiNodeCapability";

export type AIRegenerationScopeType =
  | "none"
  | "content-only"
  | "style-only"
  | "responsive-only"
  | "node-subtree"
  | "page";

export type AIRegenerationScope = Readonly<{
  widgetType: NativeAIWidgetType;
  supportedScopes: AIRegenerationScopeType[];
  defaultScope: AIRegenerationScopeType;
  requiresUserApproval: true;
  preserveUserEditsRequired: true;
  safeToday: false;
  blockers: string[];
}>;

export function buildRegenerationScopes(widgetTypes: readonly NativeAIWidgetType[]): AIRegenerationScope[] {
  return widgetTypes.map((widgetType) => {
    const supportedScopes: AIRegenerationScopeType[] =
      widgetType === "page"
        ? ["none", "page"]
        : ["none", "content-only", "style-only", "node-subtree"];

    return Object.freeze({
      widgetType,
      supportedScopes,
      defaultScope: "none",
      requiresUserApproval: true as const,
      preserveUserEditsRequired: true as const,
      safeToday: false as const,
      blockers: ["REGENERATION_METADATA_NOT_ENFORCED", "USER_EDIT_PRESERVATION_UNPROVEN", "RELEASE_GATE_FAILED"],
    });
  });
}
