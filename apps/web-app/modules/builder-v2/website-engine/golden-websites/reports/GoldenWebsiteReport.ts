import type { GoldenWebsiteScore } from "../framework/GoldenWebsiteScore";

export type GoldenWebsiteReport = Readonly<{
  website: string;
  scores: GoldenWebsiteScore;
  warnings: readonly string[];
  failedRules: readonly string[];
  selectedComponents: readonly string[];
  compositionTrace: Readonly<{ score: number; warnings: readonly string[] }>;
  designTrace: Readonly<{ direction: string; score: number; warnings: readonly string[] }>;
}>;
