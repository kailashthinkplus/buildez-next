export type CompositionQualityWarningCode =
  | "missing-trust"
  | "conversion-too-early"
  | "cta-abuse"
  | "card-fatigue"
  | "missing-visual-storytelling"
  | "repeated-layout"
  | "missing-recommended-section";

export type CompositionQualityWarning = Readonly<{
  code: CompositionQualityWarningCode;
  message: string;
  severity: "minor" | "major";
  sectionIds: readonly string[];
}>;

export type CompositionQualityScore = Readonly<{
  score: number;
  rhythmScore: number;
  trustScore: number;
  conversionScore: number;
  visualBalanceScore: number;
  densityScore: number;
  warnings: readonly CompositionQualityWarning[];
  suggestions: readonly string[];
  passed: boolean;
}>;
