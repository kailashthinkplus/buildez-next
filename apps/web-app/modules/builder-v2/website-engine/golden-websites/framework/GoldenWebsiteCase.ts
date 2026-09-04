import type { CompositionQualityWarningCode } from "../../composition-quality";

export type GoldenCapability = "native-nodes" | "editable" | "responsive" | "serializable" | "runtime-parity";

export type GoldenWebsiteSection = Readonly<{
  id: string;
  category: string;
  purpose: string;
  componentVariantId: string;
}>;

export type GoldenWebsiteCase = Readonly<{
  id: string;
  industry: string;
  archetype: string;
  businessProfile: Readonly<{ businessName: string; family: string; offerings: readonly string[]; conversionGoal: string }>;
  expectedSections: readonly string[];
  expectedComponents: readonly string[];
  sections: readonly GoldenWebsiteSection[];
  expectedScores: Readonly<{ composition: number; design: number; overall: number }>;
  requiredCapabilities: readonly GoldenCapability[];
  antiPatterns: readonly CompositionQualityWarningCode[];
  premium: boolean;
}>;
