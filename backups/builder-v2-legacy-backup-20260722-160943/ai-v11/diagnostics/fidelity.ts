export type FidelitySeverity = "warning" | "error";

export type FidelityLocation = Readonly<{
  file: string;
  line: number;
  column: number;
}>;

export type FidelityDiagnostic = Readonly<{
  code: string;
  severity: FidelitySeverity;
  message: string;
  astNodeType?: string;
  sourceSnippet?: string;
  affectedNode?: string;
  location: FidelityLocation;
  recommendedLowering: string;
  feature?: string;
}>;

export function fidelityDiagnostic(input: FidelityDiagnostic): FidelityDiagnostic {
  return Object.freeze({ ...input, location: Object.freeze({ ...input.location }) });
}

export function hasFidelityErrors(diagnostics: readonly FidelityDiagnostic[]): boolean {
  return diagnostics.some((diagnostic) => diagnostic.severity === "error");
}
