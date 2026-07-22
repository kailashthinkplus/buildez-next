import type { WidgetPopulationDiagnostic } from "./contracts";
export const populationDiagnostic = (code: string, message: string, severity: "warning" | "error" = "error", path?: string): WidgetPopulationDiagnostic => Object.freeze({ code, message, severity, path });
