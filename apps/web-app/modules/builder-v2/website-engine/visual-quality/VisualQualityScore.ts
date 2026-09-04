export type VisualQualityWarning = Readonly<{
  code: string;
  message: string;
  nodeIds: readonly string[];
}>;

export type VisualQualityScore = Readonly<{
  layout: number;
  typography: number;
  hierarchy: number;
  imagery: number;
  responsive: number;
  overall: number;
  warnings: readonly VisualQualityWarning[];
}>;
