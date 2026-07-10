import { buildWidgetAiReadiness } from "./widgetAiReadiness";
import { buildWidgetCapabilities, SCAFFOLD_WIDGET_CAPABILITIES } from "./widgetCapabilities";
import { buildWidgetInspectorSupport } from "./widgetInspectorSupport";
import { validateWidgetSerializationSupport } from "./widgetSerializationSupport";

export type WidgetModernizationSummary = Readonly<{
  totalWidgets: number;
  registeredWidgets: number;
  scaffoldWidgets: number;
  productionReadyWidgets: number;
  blockedAiWidgets: number;
  serializationValid: boolean;
  warnings: readonly string[];
}>;

export function buildWidgetModernizationSummary(): WidgetModernizationSummary {
  const capabilities = buildWidgetCapabilities();
  const aiReadiness = buildWidgetAiReadiness();
  const inspectorSupport = buildWidgetInspectorSupport();
  const serialization = validateWidgetSerializationSupport();
  const warnings = [
    ...capabilities.flatMap((capability) => capability.safetyWarnings),
    ...serialization.issues,
    ...inspectorSupport
      .filter((support) => !support.hasAdvancedControls)
      .map((support) => `${support.type} missing advanced inspector metadata.`),
  ];

  return {
    totalWidgets: capabilities.length,
    registeredWidgets: capabilities.filter((capability) => capability.registered).length,
    scaffoldWidgets: SCAFFOLD_WIDGET_CAPABILITIES.length,
    productionReadyWidgets: capabilities.filter((capability) => capability.productionReady).length,
    blockedAiWidgets: aiReadiness.filter((readiness) => readiness.status !== "baseline").length,
    serializationValid: serialization.valid,
    warnings,
  };
}

export function getScaffoldWidgetTypes(): string[] {
  return SCAFFOLD_WIDGET_CAPABILITIES.map((capability) => String(capability.type));
}
