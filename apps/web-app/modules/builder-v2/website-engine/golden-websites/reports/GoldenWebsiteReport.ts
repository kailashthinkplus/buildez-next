import type { GoldenWebsiteScore } from "../framework/GoldenWebsiteScore";
import type { CreativeDirectionPlan, CreativeWarning } from "../../creative-director";

export type GoldenWebsiteReport = Readonly<{
  website: string;
  scores: GoldenWebsiteScore;
  warnings: readonly string[];
  failedRules: readonly string[];
  selectedComponents: readonly string[];
  compositionTrace: Readonly<{ score: number; warnings: readonly string[] }>;
  designTrace: Readonly<{ direction: string; score: number; warnings: readonly string[] }>;
  creativeScore: number;
  creativeWarnings: readonly CreativeWarning[];
  creativeDirectionPlan: CreativeDirectionPlan;
}>;
