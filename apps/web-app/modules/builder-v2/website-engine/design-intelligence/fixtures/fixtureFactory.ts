import type { DesignResult } from "../../design";
import type { BrandIntelligenceProfile } from "../../sdk";
import type { DesignIntelligenceInput } from "../DesignExecutionPlan";

export type GoldenDesignFixture = Readonly<{
  id: string;
  input: DesignIntelligenceInput;
  expected: Readonly<{ visualDirection: string; typography: string; density: string; media: string; minimumScore: number }>;
}>;

export function createGoldenDesignInput(family: string, language: string, density: "compact" | "balanced" | "airy", premiumLevel: "premium" | "luxury" = "premium"): DesignIntelligenceInput {
  const designResult = {
    id: `design.${family}`, version: "1", designLanguage: { name: language },
    typographyProfile: { headingFamily: "intent-heading", bodyFamily: "intent-body", scale: density, behavior: [] },
    spacingProfile: { sectionY: density === "airy" ? 120 : density === "compact" ? 80 : 96, gutter: 32, gridGap: 24, behavior: [] },
    layoutProfile: { maxWidth: family === "real_estate" ? "1280px" : "1200px", grid: "intent", imageTreatment: "intent", behavior: [] },
    motionProfile: { level: "low", behavior: ["reveal"] }, responsiveProfile: { mobile: ["stack"], tablet: ["reduce"], desktop: ["expand"] },
    densityProfile: { level: density, curve: [] }, themeProfile: { radius: "12px", shadow: "none", background: [] },
  } as DesignResult;
  const brandProfile: BrandIntelligenceProfile = {
    id: `brand.${family}`, version: "0.1.0", personality: [], voice: "clear", tone: "calm", emotionalPositioning: [], audiencePerception: [], trustPosture: "evidence-led", storyAngle: "", differentiation: [], premiumLevel, energyLevel: "balanced", localityPositioning: "global", brandRisks: [], brandConstraints: [], existingBrandAssets: [], missingBrandFacts: [],
  };
  return Object.freeze({ designResult, brandProfile, businessFamily: family, archetype: "premium", selectedComponents: Object.freeze([]) });
}
