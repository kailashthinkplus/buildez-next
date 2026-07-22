import { buildWidgetCapabilities } from "./widgetCapabilities";

export type WidgetAiReadiness = Readonly<{
  type: string;
  status: "baseline" | "blocked" | "gated" | "scaffold-only";
  canAIInsert: boolean;
  canAIEditContent: boolean;
  canAIEditStyle: boolean;
  canAIUseInspector: boolean;
  warnings: readonly string[];
}>;

export function buildWidgetAiReadiness(): WidgetAiReadiness[] {
  return buildWidgetCapabilities().map((capability) => {
    const blocked = capability.scaffoldOnly || capability.aiReadinessStatus === "blocked" || capability.aiReadinessStatus === "gated";

    return {
      type: String(capability.type),
      status: capability.scaffoldOnly ? "scaffold-only" : capability.aiReadinessStatus === "gated" ? "gated" : blocked ? "blocked" : "baseline",
      canAIInsert: false,
      canAIEditContent: !blocked && capability.editableProps.length > 0,
      canAIEditStyle: !blocked && capability.editableStyles.length > 0,
      canAIUseInspector: !blocked && capability.supportedInspectorGroups.length > 0,
      warnings: capability.safetyWarnings,
    };
  });
}

export function getBlockedAiWidgets(): WidgetAiReadiness[] {
  return buildWidgetAiReadiness().filter((readiness) => readiness.status !== "baseline");
}
